import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "https://philosophical-carp-quiz-de-carabin-14ca72a2.koyeb.app/api";

axios.get(`${API_URL}/`)
  .then(res => {
    console.log(res.data);
  })
  .catch(err => {
    console.error(err);
  });
