import React from 'react';
import './App.css';
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import { SnackbarProvider } from 'notistack';

import PetitionList from "./components/PetitionList";
import PetitionInfo from "./components/PetitionInfo";
import Register from "./components/Register";
import Login from "./components/Login";
import CreatePetition from "./components/CreatePetition";
import MyPetitions from "./components/MyPetitions";
import Profile from "./components/Profile";
import EditProfile from "./components/EditProfile";
import EditPetition from "./components/EditPetition";

function App() {
  return (
      <SnackbarProvider maxSnack={3} autoHideDuration={3500} variant={"success"}
                        anchorOrigin={{vertical: 'top', horizontal: 'center'}}>
        <div className="App">
          <Router>
            <div>
              <Routes>
                <Route path="/petitions" element={<PetitionList/>}/>
                <Route path="/petitions/:id" element={<PetitionInfo/>}/>
                <Route path="/petitions/create" element={<CreatePetition/>}/>
                <Route path="/petitions/:id/edit" element={<EditPetition/>}/>
                <Route path="/petitions/mine" element={<MyPetitions/>}/>
                <Route path="/register" element={<Register/>}/>
                <Route path="/login" element={<Login/>}/>
                <Route path="/profile" element={<Profile/>}/>
                <Route path="/profile/edit" element={<EditProfile/>}/>
                <Route path="*" element={<PetitionList/>}/>

              </Routes>
            </div>
          </Router>
        </div>
      </SnackbarProvider>
  );
}

export default App;
