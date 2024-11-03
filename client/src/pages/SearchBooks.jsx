import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { Container, Col, Form, Button, Card, Row } from "react-bootstrap";

import Auth from "../utils/auth";
import { SAVE_BOOK } from "../utils/mutations";
import { SEARCH_BOOKS } from "../utils/queries";
import { saveBookIds, getSavedBookIds } from "../utils/localStorage";

const SearchBooks = () => {
  // State for holding search input and returned book data
  const [searchInput, setSearchInput] = useState("");
  const [savedBookIds, setSavedBookIds] = useState(getSavedBookIds());

  // GraphQL hooks for searchBooks and saveBook
  const { data, loading, error } = useQuery(SEARCH_BOOKS, {
    variables: { query: searchInput },
    skip: !searchInput, // Skip query if there's no search input
  });

  const [saveBook] = useMutation(SAVE_BOOK);

  // Effect to save `savedBookIds` to localStorage
  useEffect(() => {
    saveBookIds(savedBookIds);
  }, [savedBookIds]);

  // Handle form submission
  const handleFormSubmit = (event) => {
    event.preventDefault();
    if (!searchInput) {
      return;
    }
    // The query will automatically execute when `searchInput` changes
  };

  // create function to handle saving a book to our database
  const handleSaveBook = async (bookId) => {
    const bookToSave = data.searchBooks.find((book) => book.bookId === bookId);

    // get token
    const token = Auth.loggedIn() ? Auth.getToken() : null;

    if (!token) {
      return false;
    }

    try {
      await saveBook({
        variables: { book: bookToSave },
      });

      // If successful, add bookId to savedBookIds
      setSavedBookIds([...savedBookIds, bookToSave.bookId]);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <div className="text-light bg-dark p-5">
        <Container>
          <h1>Search for Books!</h1>
          <Form onSubmit={handleFormSubmit}>
            <Row>
              <Col xs={12} md={8}>
                <Form.Control
                  name="searchInput"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  type="text"
                  size="lg"
                  placeholder="Search for a book"
                />
              </Col>
              <Col xs={12} md={4}>
                <Button type="submit" variant="success" size="lg">
                  Submit Search
                </Button>
              </Col>
            </Row>
          </Form>
        </Container>
      </div>

      <Container>
        <h2 className="pt-5">
          {data?.searchBooks?.length
            ? `Viewing ${data.searchBooks.length} results:`
            : "Search for a book to begin"}
        </h2>
        <Row>
          {loading && <p>Loading...</p>}
          {error && <p>Error occurred: {error.message}</p>}
          {data?.searchBooks?.map((book) => (
            <Col md="4" key={book.bookId}>
              <Card border="dark">
                {book.image && (
                  <Card.Img
                    src={book.image}
                    alt={`The cover for ${book.title}`}
                    variant="top"
                  />
                )}
                <Card.Body>
                  <Card.Title>{book.title}</Card.Title>
                  <p className="small">Authors: {book.authors.join(", ")}</p>
                  <Card.Text>{book.description}</Card.Text>
                  {Auth.loggedIn() && (
                    <Button
                      disabled={savedBookIds?.includes(book.bookId)}
                      className="btn-block btn-info"
                      onClick={() => handleSaveBook(book.bookId)}
                    >
                      {savedBookIds?.includes(book.bookId)
                        ? "This book has already been saved!"
                        : "Save this Book!"}
                    </Button>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </>
  );
};

export default SearchBooks;
