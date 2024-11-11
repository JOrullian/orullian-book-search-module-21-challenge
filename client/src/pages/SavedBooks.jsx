import { useQuery, useMutation } from "@apollo/client";
import { Container, Card, Button, Row, Col } from "react-bootstrap";
import Auth from "../utils/auth";
import { GET_ME } from "../utils/queries";
import { REMOVE_BOOK } from "../utils/mutations";
import { removeBookId } from "../utils/localStorage";

const SavedBooks = () => {
  const { loading, data, error } = useQuery(GET_ME, {
    // Optional: Add skip or error handling if needed.
    onError: (error) => console.error("GET_ME query error:", error.message),
  });

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  const [removeBook] = useMutation(REMOVE_BOOK);

  // If data is not yet loaded or empty, initialize userData with empty savedBooks
  const userData = data?.me || { savedBooks: [] };

  // Handle loading state
  if (loading) {
    return <h2>LOADING...</h2>;
  }

  // Handle deleting a book
  const handleDeleteBook = async (bookId) => {
    try {
      const token = Auth.loggedIn() ? Auth.getToken() : null;
  
      if (!token) {
        console.error("No valid token found.");
        return false;
      }
  
      const { data } = await removeBook({
        variables: { bookId },
        context: {
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
      });
  
      removeBookId(bookId); // Update local storage if mutation is successful
      console.log("Book removed:", data);
    } catch (err) {
      console.error("Error during delete:", err);
    }
  };

  return (
    <>
      <div fluid className="text-light bg-dark p-5">
        <Container>
          <h1>Viewing saved books!</h1>
        </Container>
      </div>
      <Container>
        <h2 className="pt-5">
          {userData.savedBooks.length
            ? `Viewing ${userData.savedBooks.length} saved ${
                userData.savedBooks.length === 1 ? 'book' : 'books'
              }`
            : 'You have no saved books!'}
        </h2>
        <Row>
          {userData.savedBooks.map((book) => (
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
                  <p className="small">Authors: {book.authors?.join(', ')}</p>
                  <Card.Text>{book.description}</Card.Text>
                  <Button
                    className="btn-block btn-danger"
                    onClick={() => handleDeleteBook(book.bookId)}
                  >
                    Delete this Book!
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </>
  );
};

export default SavedBooks;
