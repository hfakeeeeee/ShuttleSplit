import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-text">
          Made with ❤️ by <strong>HFake</strong>
        </div>
        <div className="footer-links">
          <a 
            href="https://www.facebook.com/HFakeee/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="footer-link"
          >
            <i className="fab fa-facebook"></i>
            Facebook
          </a>
          <a 
            href="https://github.com/hfakeeeeee/ShuttleSplit" 
            target="_blank" 
            rel="noopener noreferrer"
            className="footer-link"
          >
            <i className="fab fa-github"></i>
            GitHub
          </a>
          <a 
            href="https://www.linkedin.com/in/hfake/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="footer-link"
          >
            <i className="fab fa-linkedin"></i>
            LinkedIn
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
