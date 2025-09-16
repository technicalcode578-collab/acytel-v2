use wasm_bindgen::prelude::*;
use js_sys::Object;
use web_sys::console;
use std::io::Cursor;
use symphonia::core::io::MediaSourceStream;
use symphonia::core::errors::Error;

use symphonia::core::audio::SampleBuffer;

#[wasm_bindgen]
pub fn decode(data: &[u8]) -> Result<Object, JsValue> {
    console_error_panic_hook::set_once();

    let mss = MediaSourceStream::new(Box::new(Cursor::new(data.to_vec())), Default::default());
    let mut probed = symphonia::default::get_probe()
        .format(&Default::default(), mss, &Default::default(), &Default::default())
        .map_err(|e| e.to_string())?;

    let track = probed.format.default_track().ok_or("No default track")?.clone();
    let track_id = track.id;
    let sample_rate = track.codec_params.sample_rate.ok_or("No sample rate")?;

    let mut decoder = symphonia::default::get_codecs()
        .make(&track.codec_params, &Default::default())
        .map_err(|e| e.to_string())?;

    let mut all_samples_mono = Vec::<f32>::new();

    loop {
        let packet = match probed.format.next_packet() {
            Ok(packet) => packet,
            Err(Error::IoError(err)) if err.kind() == std::io::ErrorKind::UnexpectedEof => break,
            Err(e) => return Err(e.to_string().into()),
        };
        if packet.track_id() != track_id { continue; }

        match decoder.decode(&packet) {
            Ok(decoded) => {
                let spec = *decoded.spec();
                let mut sample_buf = SampleBuffer::<f32>::new(decoded.capacity() as u64, spec);
                sample_buf.copy_interleaved_ref(decoded);
                
                let channels = spec.channels.count();
                if channels > 1 {
                    for chunk in sample_buf.samples().chunks_exact(channels) {
                        let sample: f32 = chunk.iter().sum();
                        all_samples_mono.push(sample / channels as f32);
                    }
                } else {
                    all_samples_mono.extend_from_slice(sample_buf.samples());
                }
            }
            Err(Error::DecodeError(_)) => continue,
            Err(e) => return Err(e.to_string().into()),
        }
    }
    
    let result_obj = Object::new();
    let pcm_data_array = js_sys::Float32Array::from(&all_samples_mono[..]);

    js_sys::Reflect::set(&result_obj, &"sample_rate".into(), &sample_rate.into())?;
    js_sys::Reflect::set(&result_obj, &"pcm_data".into(), &pcm_data_array.into())?;

    Ok(result_obj)
}