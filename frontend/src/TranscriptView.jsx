import React, { useState } from 'react'
import { useForm } from 'react-hook-form'

import TextField from '@material-ui/core/TextField'

import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import SaveIcon from '@material-ui/icons/Save';
import CloseIcon from '@material-ui/icons/Close';

const gpaFormat = new Intl.NumberFormat('en-IN', {maximumFractionDigits: 2});
const grades = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F'/*, 'S', 'NCR'*/];

const Course = ({course, term, deleteCourse, buttonDisplay, editCourse}) => {
    const [editMode, setEditMode] = useState( false );

    const { register, handleSubmit, errors } = useForm({ mode: 'onChange' });

    const handleToggleEdit = e => {
        e.preventDefault();
        setEditMode( !editMode );
    }

    const onSaveClick = data => {
        // If nothing changed or the course was successfully editted, toggle edit mode
        if ( (course.name === data.name && course.cHours == data.cHours && course.grade === data.grade) || editCourse({ term: term, orgName: course.name, name: data.name, cHours: data.cHours, grade: data.grade }) )
            setEditMode( !editMode );
    }

    const handleDeleteClick = e => {
        e.preventDefault();
        deleteCourse({term: term, name: course.name});
    }

    if ( editMode )
        return (
            <div className="course-block">
                <form id="edit-course-form" style={{width: '100%'}}>
                    <div className="edit-course-header">
                        <TextField defaultValue={course.name} name="name" error={!!errors.name} inputRef={ register({ required: true }) } style={{ width: '160px' }} label="Course Name" variant="outlined" size="small" type="text" />
                        <div style={{display: 'flex'}}>
                            <IconButton onClick={ handleSubmit(onSaveClick) } size="small"><SaveIcon color="primary" fontSize="small"/></IconButton>
                            <IconButton onClick={ handleToggleEdit } size="small"><CloseIcon fontSize="small"/></IconButton>
                            <IconButton onClick={ handleDeleteClick } style={{ color: '#ff726f' }} size="small"><DeleteIcon fontSize="small"/></IconButton>
                        </div>
                    </div>
                    <div style={{display:'flex', justifyContent:'space-between'}}>
                        <TextField defaultValue={course.cHours} style={{width: '115px'}} name="cHours" error={!!errors.cHours} inputRef={ register({ required: true, pattern: /\d/, min: 1, max: 5 }) } label="Credits" variant="outlined" size="small" type="number"/>
                        <TextField defaultValue={course.grade} style={{width: '115px'}} label="Letter Grade" variant="outlined" size="small" type="text" name="grade" error={!!errors.grade} inputRef={ register({ required: true, validate: { check: value => grades.includes(value) } }) }/>
                    </div>
                </form>
            </div>
        );
    else
        return (
            <div className="course-block">
                <div style={{width:'100%'}}>
                    <div className="course-header">
                        {course.name}
                        <div style={{display: (buttonDisplay ? 'flex' : 'none')}}>
                            <IconButton onClick={ handleToggleEdit } size="small"><EditIcon fontSize="small"/></IconButton>
                            <IconButton onClick={ handleDeleteClick } style={{ color: '#ff726f' }} size="small"><DeleteIcon fontSize="small"/></IconButton>
                        </div>
                    </div>
                    <div style={{display:'flex', justifyContent:'space-between'}}>
                        <div>Credit Hours: {course.cHours}</div>
                        <div>Letter Grade: {course.grade}</div>
                    </div>
                </div>
            </div>
        );
};

const Semester = ({semester, derived, deleteSemester, deleteCourse, editCourse}) => {
    const [buttonDisplay, setButtonDisplay] = useState(false);

    const handleToggleClick = e => {
        e.preventDefault();
        setButtonDisplay(!buttonDisplay);
    }

    const handleDeleteClick = e => {
        e.preventDefault();
        deleteSemester(semester.term);
    }

    return (
        <div className="semester-card">
            <div className="semester-header">{semester.term} Semester</div>
            <div className="semester-subheader">
                <div>Credit Hours: {derived.semesterCHours}</div>
                <div>GPA: {derived.semesterCHours !== 0 ? gpaFormat.format(derived.semesterAttempted/derived.semesterCHours) : "N/A"}</div>
            </div>

            {semester.courses.map( (course, index) => <Course key={index} course={course} term={semester.term} deleteCourse={deleteCourse} buttonDisplay={buttonDisplay} editCourse={editCourse} /> )}

            <div className="semester-card-footer">
                <Button onClick={handleToggleClick} style={{marginTop: '0.5rem'}} variant="contained" size="small"><MoreHorizIcon fontSize="small"/></Button>
                <Button onClick={handleDeleteClick} style={{display: (buttonDisplay ? 'inline-flex' : 'none'), marginTop: '0.5rem', backgroundColor: '#ff2a26', color: 'white'}} variant="contained" size="small"><DeleteIcon fontSize="small"/></Button>
            </div>
        </div>
    );
};

export default Semester;