import { mapGoogleBooksResponse, mapOpenLibraryResponse } from './bookMapper';

const googleSample = {
  items: [{
    id: 'google-123',
    volumeInfo: {
      title: 'The Left Hand of Darkness',
      authors: ['Ursula K. Le Guin'],
      publisher: 'Ace Books',
      description: 'A science fiction novel.',
      publishedDate: '1969',
      pageCount: 304,
      industryIdentifiers: [{ type: 'ISBN_10', identifier: '0441478123' }],
      imageLinks: { thumbnail: 'http://books.example/cover.jpg' },
    },
  }, { id: null, volumeInfo: { title: 'Malformed item' } }],
};

const openLibrarySample = {
  docs: [{
    key: '/works/OL268431W',
    title: 'The Left Hand of Darkness',
    author_name: ['Ursula K. Le Guin'],
    publisher: ['Ace Books'],
    isbn: ['0441478123', '9780441478125'],
    publish_date: ['1969', '1976'],
    first_publish_year: 1969,
    number_of_pages_median: 304,
    cover_i: 12345,
    first_sentence: ['A first sentence.'],
  }],
};

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const google = mapGoogleBooksResponse(googleSample);
assert(google.length === 1, 'Google mapper should omit malformed items');
assert(google[0].source === 'google-books' && google[0].isbn === '0441478123', 'Google identifiers should map');
assert(google[0].cover === 'https://books.example/cover.jpg' && google[0].pageCount === 304, 'Google cover and page count should map');
assert(mapGoogleBooksResponse({ items: null }).length === 0, 'Missing Google items should return an empty list');

const openLibrary = mapOpenLibraryResponse(openLibrarySample);
assert(openLibrary.length === 1, 'Open Library sample should map');
assert(openLibrary[0].publisher === 'Ace Books' && openLibrary[0].isbn === '0441478123', 'Open Library publisher and ISBN should map');
assert(openLibrary[0].cover === 'https://covers.openlibrary.org/b/id/12345-M.jpg', 'Open Library cover should map');
assert(openLibrary[0].publicationDate === '1969', 'Open Library publication date should map');
assert(mapOpenLibraryResponse({ docs: [{ key: '/works/OL1W' }] }).length === 0, 'Incomplete Open Library records should be omitted');

console.log('Book mapper sample checks passed.');
