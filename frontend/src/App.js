import React, { useState } from 'react';

import Button from '@material-ui/core/Button'
import { CSSTransition } from 'react-transition-group'

import ApiService from './ApiService'
import UserControlCard from './UserControlPanel'
import TranscriptControlPanel from './TranscriptControlPanel'
import Trends from './TrendsPanel'
import Semester from './TranscriptView'

import './styles/App.css';
import './styles/animations.css'

const apiservice = new ApiService();
const gpaFormat = new Intl.NumberFormat('en-IN', {maximumFractionDigits: 2});
const sessions = ["Spring", "Summer", "Fall", "Winter"];
const letters = ['F', 'D', 'C', 'B', 'A'];

const interpretLetterGrade = (grade) => {
  // Letter Value: Base points. Index of the array matches value. 0:F 1:D 2:C 3:B 4:A
  // Modifier: Add points to (Base-1). +:0.33 -:0.67
  let val = letters.indexOf(grade.charAt(0));
  if (grade.length === 2) val += grade.charAt(1) === '+' ? (0.33) : (-1 + 0.67);
  return val;
};

const semesterSort = (a, b) => {
  const [aSession, aYear] = a.term.split(" ");
  const [bSession, bYear] = b.term.split(" ");
  let retComp = 0;

  if (aYear === bYear) retComp = sessions.indexOf(aSession) > sessions.indexOf(bSession) ? 1 : -1;
  else retComp = aYear > bYear ? 1 : -1;
  
  if (retComp === 0) alert('Error in semesterSort function! Two terms cannot be equal.');
  return retComp;
};

/* function App
 * States:
 *  - user: Holds user information. {username: "", firstname: ""}
 *  - transcript: Holds user transcript. [{term: "", courses: [ {name: "", cHours: int, grade: ""}, ]}, ]
 *  - derived: Holds derived information. {cumulativeCHours: int, cumulativeAttempted: float, semesters: [{semesterCHours: int, semesterAttempted: float}, ]}
 *  - terms: Holds list of terms in transcript. ["", ]
 *  - displayTrends: Boolean. Toggles display of transcript trends.
 * 
 * Functions:
 *  - login (user: {username: "", firstname: ""})
 *  - signOut
 *  - loadTranscript (transfer: [{term: "", courses: []}, ])
 *  - save: updates user's transcript in the database
 *  - refresh: downloads user's transcript from database
 *  - addSemester (term: "")
 *  - deleteSemester (term: "")
 *  - addCourse (course: {term: "", name: "", cHours: "", grade: ""})
 *  - deleteCourse (course: {term: "", name: ""})
 *  - editCourse (edittedCourse: {term: "", orgName: "", name: "", cHours: "", grade: ""})
 */
const App = () => {
  const [user, setUser] = useState({username: '', firstname: '', sessionToken: ''});
  const [transcript, setTranscript] = useState( [] );
  const [derived, setDerived] = useState( {cumulativeCHours: 0, cumulativeAttempted: 0, semesters: []} );
  const [terms, setTerms] = useState( [] );
  const [displayTrends, setDisplayTrends] = useState( false );

  const login = token => {
    apiservice.getCurrentUser(token).then(response => response.json()).then(value => {
      setUser( {username: value.username, firstname: value.firstname, sessionToken: token} );
    }).catch(err => console.log('Error retrieving user information: ' + err));

    apiservice.getCurrentUserTranscript(token).then(response => response.json()).then(value => {
      loadTranscript(value);
    }).catch(err => console.log('Error retrieving user transcript: ' + err));
  }

  const signOut = () => {
    setUser( {username: '', firstname: '', sessionToken: ''} );
    setTranscript( [] );
    setDerived( {cumulativeCHours: 0, cumulativeAttempted: 0, semesters: []} );
    setTerms( [] );
    setDisplayTrends( false );
  }

  const loadTranscript = transfer => {
    let newDerived = {cumulativeCHours: 0, cumulativeAttempted: 0, semesters: []};
    let newTerms = [];

    for (let x = 0; x < transfer.length; x++) {
      newTerms.push(transfer[x].term);
      newDerived.semesters.push({semesterCHours: 0, semesterAttempted: 0});
      for (const course of transfer[x].courses) {
        let [cHours, attempted] = [parseInt(course.cHours, 10), interpretLetterGrade(course.grade) * parseInt(course.cHours, 10)];
        newDerived.semesters[x].semesterCHours += cHours;
        newDerived.semesters[x].semesterAttempted += attempted;
        newDerived.cumulativeCHours += cHours;
        newDerived.cumulativeAttempted += attempted;
      }
    }

    setTranscript([...transfer]);
    setDerived(newDerived);
    setTerms(newTerms);
  }

  const save = () => {
    apiservice.updateCurrentUserTranscript(user.sessionToken, transcript).then(response => response.json()).then(value => console.log(value.message)).catch(err => console.error(err));
  }

  const refresh = () => {
    if ( !window.confirm("Are you sure you want to refresh your transcript?\nUnsaved changes will be lost.") ) return;

    setTranscript( [] );
    setDerived( {cumulativeCHours: 0, cumulativeAttempted: 0, semesters: []} );
    setTerms( [] );

    apiservice.getCurrentUserTranscript(user.sessionToken).then(response => response.json()).then(value => loadTranscript(value)).catch(err => console.log('Error retrieving user transcript. Error: ' + err));
  }

  const addSemester = term => {
    // Creates new transcript with the new term then sorts the transcript.
    let newTranscript = [...transcript, {term: term, courses: []}];
    newTranscript.sort(semesterSort);

    // Updates list of terms.
    let newTerms = [];
    for (const semester of newTranscript) newTerms.push(semester.term);

    // Adds empty semester object to derived
    let newDerived = {cumulativeCHours: derived.cumulativeCHours, cumulativeAttempted: derived.cumulativeAttempted, semesters: [...derived.semesters]};
    let index;
    for (index = 0; index < newTranscript.length; index++) if (newTranscript[index].term === term) break;
    newDerived.semesters.splice(index, 0, {semesterCHours: 0, semesterAttempted: 0});

    setTranscript(newTranscript);
    setTerms(newTerms);
    setDerived(newDerived);
  }

  const deleteSemester = term => {
    // Searches for term to be deleted and validates
    let delIndex = -1;
    for (let x = 0; x < transcript.length; x++) if (transcript[x].term === term) delIndex = x;
    if (delIndex === -1) {
      alert(`Term "${term}" to be deleted not found in transcript. Aborting delete.`);
      return;
    }

    // Removes semester from transcript
    let newTranscript = [...transcript];
    newTranscript.splice(delIndex, 1);

    // Updates terms
    let newTerms = terms;
    newTerms.splice(delIndex, 1);

    // Updates derived, recalculates cumulative GPA
    let newDerived = {cumulativeCHours: 0, cumulativeAttempted: 0, semesters: [...derived.semesters]};
    const removedSemester = (newDerived.semesters.splice(delIndex, 1))[0];
    [newDerived.cumulativeCHours, newDerived.cumulativeAttempted] = [derived.cumulativeCHours - removedSemester.semesterCHours, derived.cumulativeAttempted - removedSemester.semesterAttempted];

    setTranscript(newTranscript);
    setTerms(newTerms);
    setDerived(newDerived);
  }

  const addCourse = course => {
    let newTranscript = [...transcript];
    let newDerived = {cumulativeCHours: derived.cumulativeCHours, cumulativeAttempted: derived.cumulativeAttempted, semesters: [...derived.semesters]};

    // Adds course to semester, then adds course values to the semester's and cumulative statistics.
    for (let x = 0; x < newTranscript.length; x++) {
      if (newTranscript[x].term === course.term) {
        // Adds course to transcript semester
        newTranscript[x].courses.push({name: course.name, cHours: course.cHours, grade: course.grade});

        // Updates GPA
        let [cHours, attempted] = [parseInt(course.cHours, 10), interpretLetterGrade(course.grade) * parseInt(course.cHours, 10)];
        newDerived.semesters[x].semesterCHours += cHours;
        newDerived.semesters[x].semesterAttempted += attempted;
        newDerived.cumulativeCHours += cHours;
        newDerived.cumulativeAttempted += attempted;
      }
    }

    setTranscript(newTranscript);
    setDerived(newDerived);
  }

  const deleteCourse = course => {
    // Searches for course and its term to be deleted.
    let [semIndex, courseIndex] = [-1, -1];
    for (let x = 0; x < transcript.length; x++) {
      if (transcript[x].term === course.term) {
        semIndex = x;
        for (let y = 0; y < transcript[x].courses.length; y++)
          if (transcript[semIndex].courses[y].name === course.name)
            courseIndex = y;
      }
    }

    // Validates
    if (semIndex === -1 || courseIndex === -1) {
      alert(`Could not find either semester term or course.\n\nTermIndex: "${course.term}", ${semIndex} \nCourse, Index: "${course.name}", ${courseIndex} \n\nAborting delete.`);
      return;
    }

    // Removes course from transcript
    let newTranscript = [...transcript];
    const removedCourse = newTranscript[semIndex].courses.splice(courseIndex, 1)[0];
    
    // Updates GPA
    let newDerived = {cumulativeCHours: derived.cumulativeCHours, cumulativeAttempted: derived.cumulativeAttempted, semesters: [...derived.semesters]};
    const removeCHours = parseInt(removedCourse.cHours, 10);
    const removeAttempted = interpretLetterGrade(removedCourse.grade) * parseInt(removedCourse.cHours, 10);
    newDerived.semesters[semIndex].semesterCHours -= removeCHours;
    newDerived.semesters[semIndex].semesterAttempted -= removeAttempted;
    newDerived.cumulativeCHours -= removeCHours;
    newDerived.cumulativeAttempted -= removeAttempted;

    setTranscript(newTranscript);
    setDerived(newDerived);
  }

  const editCourse = edittedCourse => {
    // Searches for course by its original name and its term to be deleted.
    let [semIndex, courseIndex] = [-1, -1];
    let doesCourseExist = false;
    for (let x = 0; x < transcript.length; x++) {
      if (transcript[x].term === edittedCourse.term) {
        semIndex = x;
        for (let y = 0; y < transcript[x].courses.length; y++) {
          if (transcript[semIndex].courses[y].name === edittedCourse.orgName) courseIndex = y;
          else if (transcript[semIndex].courses[y].name === edittedCourse.name) doesCourseExist = true;
        }
      }
    }

    // Validates
    if (semIndex === -1 || courseIndex === -1 || doesCourseExist) {
      if (courseIndex === -1) alert(`Could not find either semester term or course.\n\nTermIndex: "${edittedCourse.term}", ${semIndex} \nCourse, Index: "${edittedCourse.orgName}", ${courseIndex} \n\nAborting edit.`);
      else if (doesCourseExist) alert(`A course named "${edittedCourse.name}" already exists in this semester. Please use a different name.`);
      return false;
    }

    // Updates course in transcript
    let newTranscript = [...transcript];
    const orgCourse = newTranscript[semIndex].courses.splice(courseIndex, 1, {name: edittedCourse.name, cHours: edittedCourse.cHours, grade: edittedCourse.grade})[0];

    // Updates GPA: Calculates delta between the editted cHours/attempted, adds delta to derived.
    let newDerived = {cumulativeCHours: derived.cumulativeCHours, cumulativeAttempted: derived.cumulativeAttempted, semesters: [...derived.semesters]};
    const deltaCHours = parseInt(edittedCourse.cHours, 10) - parseInt(orgCourse.cHours, 10);
    const deltaAttempted = (interpretLetterGrade(edittedCourse.grade) * parseInt(edittedCourse.cHours, 10)) - (interpretLetterGrade(orgCourse.grade) * parseInt(orgCourse.cHours, 10));
    newDerived.semesters[semIndex].semesterCHours += deltaCHours;
    newDerived.semesters[semIndex].semesterAttempted += deltaAttempted;
    newDerived.cumulativeCHours += deltaCHours;
    newDerived.cumulativeAttempted += deltaAttempted;

    setTranscript(newTranscript);
    setDerived(newDerived);
    return true;
  }

  const handleTrendsClick = e => {
    e.preventDefault();
    setDisplayTrends( !displayTrends );
  }

  return (
    <div className="App">
      <div className="container">
        <div className="control-container">

          <div className="page-title-card">
            <div className="page-title">React Gradebook</div>
            <div className="page-subtitle">by Nykolas Farhangi</div>
          </div>

          <UserControlCard apiservice={apiservice} user={user} login={login} signOut={signOut} refresh={refresh} save={save} />

          <div className="control-card">
            <div className="control-header">Cumulative Statistics</div>
            <div style={{marginTop: '0.5rem', marginBottom: '0.75rem', marginLeft: '1rem'}}>
              Total Credit Hours: {derived.cumulativeCHours}<br/>
              Total Attempted Points: { derived.cumulativeAttempted > 0 ? gpaFormat.format(derived.cumulativeAttempted) : 0 }<br/> {/* COULD CAUSE ISSUES DOWN THE ROAD */}
              GPA: { derived.cumulativeCHours !== 0 ? gpaFormat.format( derived.cumulativeAttempted/derived.cumulativeCHours ) : "Not available." }
            </div>
            <Button onClick={handleTrendsClick} disabled={ !transcript.length } variant="outlined" size="small">View Transcript Trends</Button>
          </div>

          <TranscriptControlPanel terms={terms} addSemester={addSemester} addCourse={addCourse} />
        </div>
        <div className="semester-container">
          <div className="semester-card-container">
              { displayTrends ? <Trends terms={terms} derived={derived} /> : <></> }

              { transcript.map( (semester, index) => { 
                return(
                  <CSSTransition classNames={'cards'} in={ transcript[index] } appear={ transcript[index] } timeout={200}>
                    <Semester key={index} semester={semester} derived={derived.semesters[index] ? derived.semesters[index] : {semesterCHours: 0, semesterAttempted: 0}} deleteSemester={deleteSemester} deleteCourse={deleteCourse} editCourse={editCourse} />
                  </CSSTransition>
              );})}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;

//{ transcript.map( (semester, index) => <Semester key={index} semester={semester} derived={derived.semesters[index] ? derived.semesters[index] : {semesterCHours: 0, semesterAttempted: 0}} deleteSemester={deleteSemester} deleteCourse={deleteCourse} editCourse={editCourse} />) }