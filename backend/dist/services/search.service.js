"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.indexTrack = exports.initializeTrackCollection = void 0;
const search_1 = require("../core/search");
// CORRECTED SCHEMA: The field name is now 'uploaded_by' to match the error log.
const schema = {
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
const initializeTrackCollection = async () => {
    try {
        const collections = await search_1.typesenseClient.collections().retrieve();
        const collectionExists = collections.some((collection) => collection.name === 'tracks');
        if (!collectionExists) {
            await search_1.typesenseClient.collections().create(schema);
            console.log('Successfully created "tracks" collection in Typesense with correct schema.');
        }
        else {
            console.log('"tracks" collection already exists in Typesense.');
        }
    }
    catch (error) {
        console.error('Error initializing Typesense collection:', error);
    }
};
exports.initializeTrackCollection = initializeTrackCollection;
const indexTrack = async (track) => {
    try {
        // CORRECTED INDEXING: We now use 'uploaded_by' to match the schema.
        await search_1.typesenseClient.collections('tracks').documents().create({
            id: track.id.toString(),
            title: track.title,
            artist: track.artist,
            album: track.album,
            uploaded_by: track.uploaded_by.toString(),
        });
    }
    catch (error) {
        // It's helpful to log the track object that failed
        console.error(`Error indexing track ${track.id}:`, error, { track });
    }
};
exports.indexTrack = indexTrack;
