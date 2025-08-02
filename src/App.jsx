import React from "react";
import UI from "./Frontend/Ui";
import VI from "./Frontend/Vi";
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<UI />} />
        <Route path='/volume' element={<VI />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
