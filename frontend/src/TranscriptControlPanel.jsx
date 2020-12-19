import React from 'react'
import { useForm } from 'react-hook-form'

import Autocomplete from '@material-ui/lab/Autocomplete'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button';

const grades = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F'/*, 'S', 'NCR'*/];
const sessions = ["Spring", "Summer", "Fall", "Winter"];

const TranscriptControlPanel = ({terms, addSemester, addCourse}) => {
    const { register: registerSemester, handleSubmit: handleSubmitSemester, errors: semesterErrors, reset: resetSemester } = useForm({ mode: 'onChange' });
    const { register: registerCourse, handleSubmit: handleSubmitCourse, errors: courseErrors, reset: resetCourse } = useForm({ mode: 'onChange' });

    const onSubmitSemester = data => {
        let term = `${data.session} ${data.year}`;
        if ( !terms.includes(term) ) addSemester(`${data.session} ${data.year}`);
        resetSemester();
    }

    const onSubmitCourse = data => {
        console.log(data);
        addCourse( {term: data.term, name: data.name, cHours: data.credits, grade: data.grade} );
        resetCourse();
    }

    return (
        <>
            <div className="control-card">
                <div className="control-header">Add Semester</div>
                <form id="add-semester-form" onSubmit={ handleSubmitSemester(onSubmitSemester) } style={{marginTop:'0.75rem'}}>
                    <div style={{marginBottom:'0.5rem', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                        <Autocomplete id='semesterSessionAutoComplete' style={{width: '150px'}} options={sessions} getOptionLabel={option => option}
                            renderInput={params => <TextField {...params} name="session" error={!!semesterErrors.session} inputRef={ registerSemester({ required: true }) } label="Session" variant="outlined" size="small" type="text"/>} />
                        <TextField label="Year" name="year" error={!!semesterErrors.year} inputRef={ registerSemester({ required: true, pattern: /\d\d\d\d/, maxLength: 4 }) } style={{width: '145px'}} variant="outlined" size="small" type="text"/>
                    </div>
                    <Button onClick={ handleSubmitSemester(onSubmitSemester) } color="primary" variant="contained" aria-label="add semester">Add</Button>
                </form>
            </div>
            <div className="control-card">
                <div className="control-header">Add Course</div>
                <form id="add-course-form" onSubmit={ handleSubmitCourse(onSubmitCourse) } style={{marginTop:'0.75rem'}}>
                    <TextField name="name" error={!!courseErrors.name} inputRef={ registerCourse({ required: true }) } style={{width: '100%'}} label="Course Name" variant="outlined" size="small" type="text"/>
                    <div style={{margin:'0.5rem 0', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                        <TextField name="credits" error={!!courseErrors.credits} inputRef={ registerCourse({ required: true, pattern: /\d/, min: 1, max: 5 }) } style={{width: '125px'}} label="Credits" variant="outlined" size="small" type="number"/>
                        <TextField style={{width: '125px'}} label="Letter Grade" variant="outlined" size="small" type="text" name="grade" error={!!courseErrors.grade} inputRef={ registerCourse({ required: true, validate: { check: value => grades.includes(value) } }) }/>
                    </div>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                        <Autocomplete id='courseTermAutoComplete' style={{width: '190px'}} options={terms} getOptionLabel={option => option}
                            renderInput={params => <TextField {...params} name="term" error={!!courseErrors.term} inputRef={ registerCourse({ required: true }) } label="Term" variant="outlined" size="small" type="text"/>} />
                        <Button onClick={ handleSubmitCourse(onSubmitCourse) } disabled={!terms.length} color="primary" variant="contained" aria-label="add course">Add</Button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default TranscriptControlPanel;