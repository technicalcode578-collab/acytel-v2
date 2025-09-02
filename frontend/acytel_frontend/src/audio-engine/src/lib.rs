use wasm_bindgen::prelude::*;
use std::io::Cursor;
use symphonia::core::io::MediaSourceStream;
use symphonia::core::meta::MetadataOptions;
use symphonia::core::errors::Error;
use symphonia::core::formats::{FormatOptions, FormatReader};
use symphonia::core::codecs::{Decoder as SymphoniaDecoder, DecoderOptions};
use symphonia::core::audio::{SampleBuffer, SignalSpec};

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

macro_rules! console_log {
    ($($t:tt)*) => (log(&format_args!($($t)*).to_string()))
}

#[wasm_bindgen]
pub struct Decoder {
    reader: Box<dyn FormatReader>,
    decoder: Box<dyn SymphoniaDecoder>,
    track_id: u32,
    spec: SignalSpec,
}

#[wasm_bindgen]
impl Decoder {
    #[wasm_bindgen(constructor)]
    pub fn new(data: &[u8]) -> Result<Decoder, JsValue> {
        console_error_panic_hook::set_once();
        
        let mss = MediaSourceStream::new(Box::new(Cursor::new(data.to_vec())), Default::default());

        let format_opts = FormatOptions {
            enable_gapless: true,
            ..Default::default()
        };
        let metadata_opts: MetadataOptions = Default::default();

        let probed = symphonia::default::get_probe()
            .format(&Default::default(), mss, &format_opts, &metadata_opts)
            .map_err(|e| e.to_string())?;

        let mut reader = probed.format;
        let track = reader.default_track().ok_or("No default track")?.clone();
        let track_id = track.id;
        
        let sample_rate = track.codec_params.sample_rate.ok_or("Missing sample rate")?;
        let channels = track.codec_params.channels.ok_or("Missing channel layout")?;
        let spec = SignalSpec::new(sample_rate, channels);

        let decoder_opts = DecoderOptions { verify: true };
        let decoder = symphonia::default::get_codecs()
            .make(&track.codec_params, &decoder_opts)
            .map_err(|e| e.to_string())?;

        Ok(Decoder {
            reader,
            decoder,
            track_id,
            spec,
        })
    }

    pub fn decode_chunk(&mut self, _data: &[u8]) -> Result<js_sys::Float32Array, JsValue> {
        // This is a placeholder to satisfy the interface.
        // The actual decoding will happen in a different method, as we are doing full-file decoding for now.
        let decoded_samples = Vec::new();
        Ok(js_sys::Float32Array::from(&decoded_samples[..]))
    }

    pub fn decode(&mut self) -> Result<js_sys::Float32Array, JsValue> {
        let mut all_samples = Vec::new();

        loop {
            let packet = match self.reader.next_packet() {
                Ok(packet) => packet,
                Err(Error::IoError(err)) if err.kind() == std::io::ErrorKind::UnexpectedEof => {
                    break;
                }
                Err(e) => return Err(e.to_string().into()),
            };

            if packet.track_id() != self.track_id {
                continue;
            }

            match self.decoder.decode(&packet) {
                Ok(decoded) => {
                    let spec = *decoded.spec();
                    let mut sample_buf = SampleBuffer::<f32>::new(decoded.capacity() as u64, spec);
                    sample_buf.copy_interleaved_ref(decoded);

                    let channels = spec.channels.count();
                    if channels > 1 {
                        let mut mono_samples = Vec::with_capacity(sample_buf.len() / channels);
                        let mut i = 0;
                        while i < sample_buf.len() {
                            let mut sample = 0.0;
                            for j in 0..channels {
                                sample += sample_buf.samples()[i + j];
                            }
                            mono_samples.push(sample / channels as f32);
                            i += channels;
                        }
                        all_samples.extend_from_slice(&mono_samples);
                    } else {
                        all_samples.extend_from_slice(sample_buf.samples());
                    }
                }
                Err(Error::DecodeError(err)) => {
                    console_log!("Decode error: {}", err);
                    continue;
                }
                Err(e) => return Err(e.to_string().into()),
            }
        }

        Ok(js_sys::Float32Array::from(&all_samples[..]))
    }

    #[wasm_bindgen(getter)]
    pub fn sample_rate(&self) -> u32 {
        self.spec.rate
    }

    #[wasm_bindgen(getter)]
    pub fn channels(&self) -> usize {
        self.spec.channels.count()
    }
}