import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, Row, Col } from 'react-bootstrap';

const FinancialNews = () => {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/stocks/news/')
      .then(response => setArticles(response.data))
      .catch(error => console.error('Error fetching news:', error));
  }, []);

  return (
    <div>
      <h2 className="my-4">Latest Financial News</h2>
      <Row xs={1} md={2} lg={2} className="g-4">
        {articles.map(article => (
          <Col key={article.article_id}>
            <Card className="shadow-sm">
              <Card.Img variant="top" src={article.image_url} alt={article.title} />
              <Card.Body>
                <Card.Title>{article.title}</Card.Title>
                <Card.Text>
                  <a href={article.link} target="_blank" rel="noopener noreferrer">
                    Read more
                  </a>
                </Card.Text>
                <small className="text-muted">{new Date(article.pubDate).toLocaleString()}</small>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default FinancialNews;
