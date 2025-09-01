import { typesenseClient } from '../core/search';
import { CollectionCreateSchema } from 'typesense/lib/Typesense/Collections';
import { CollectionSchema } from 'typesense/lib/Typesense/Collection';
// Assuming your Track model might have uploaded_by or uploadedBy, we'll standardize here.
// The key is that the schema and the indexing function MUST match.
interface IndexableTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  // This field name is critical and must match the schema below
  uploaded_by: string; 
}


// CORRECTED SCHEMA: The field name is now 'uploaded_by' to match the error log.
const schema: CollectionCreateSchema = {
  name: 'tracks',
  fields: [
    { name: 'title', type: 'string', sort: true },
    { name: 'artist', type: 'string', facet: true },
    { name: 'album', type: 'string' },
    // This is the corrected field definition.
    { name: 'uploaded_by', type: 'string', facet: true },
  ],
  default_sorting_field: 'title'
};

export const initializeTrackCollection = async () => {
  try {
    const collections = await typesenseClient.collections().retrieve();
    const collectionExists = collections.some((collection: CollectionSchema) => collection.name === 'tracks');

    if (!collectionExists) {
      await typesenseClient.collections().create(schema);
      console.log('Successfully created "tracks" collection in Typesense with correct schema.');
    } else {
      console.log('"tracks" collection already exists in Typesense.');
    }
  } catch (error) {
    console.error('Error initializing Typesense collection:', error);
  }
};

export const indexTrack = async (track: IndexableTrack) => {
  try {
    // CORRECTED INDEXING: We now use 'uploaded_by' to match the schema.
    await typesenseClient.collections('tracks').documents().create({
      id: track.id.toString(),
      title: track.title,
      artist: track.artist,
      album: track.album,
      uploaded_by: track.uploaded_by.toString(),
    });
  } catch (error) {
    // It's helpful to log the track object that failed
    console.error(`Error indexing track ${track.id}:`, error, { track });
  }
};