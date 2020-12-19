import React, { useState, useEffect } from 'react'

import { ResponsiveLine } from '@nivo/line'

const gpaFormat = new Intl.NumberFormat('en-IN', {maximumFractionDigits: 2});

/* function Trends
 * Parameters: 
 *  - user: Holds user information. {username: "", firstname: ""}
 *  - derived: Holds derived information. {cumulativeCHours: int, cumulativeAttempted: float, semesters: [{semesterCHours: int, semesterAttempted: float}, ]}
 *  - terms: Holds list of terms in transcript. ["", ]
 */
const Trends = ({terms, derived}) => {
    const [data, setData] = useState();

    // Generates data for GPAvSemesterRLine
    useEffect(() => {
        let semesterObject = '{ "id": "Semester", "color": "hsl(4, 82%, 56%)", "data": [';
        let cumulativeObject = '{ "id": "Cumulative", "color": "hsl(241, 82%, 56%)", "data": [';

        let cumuGPA, semGPA;
        let cumuCHours = 0;
        let cumuAttempted = 0;
        for (let x = 0; x < terms.length; x++) {
            cumuCHours += derived.semesters[x].semesterCHours;
            cumuAttempted += derived.semesters[x].semesterAttempted;
            
            cumuGPA = cumuCHours ? gpaFormat.format( cumuAttempted / cumuCHours ) : 0;
            semGPA = derived.semesters[x].semesterCHours ? gpaFormat.format( derived.semesters[x].semesterAttempted / derived.semesters[x].semesterCHours ) : 0;

            semesterObject += `{ "x": "${ terms[x] }", "y": ${ semGPA } }${ x+1 !== terms.length ? ',' : '' }` 
            cumulativeObject += `{ "x": "${ terms[x] }", "y": ${ cumuGPA } }${ x+1 !== terms.length ? ',' : '' }`
        }
        semesterObject += '] }';
        cumulativeObject += '] }';

        setData( JSON.parse(`[ ${semesterObject}, ${cumulativeObject} ]`) );
    }, [terms, derived.semesters]);

    const GPAvSemesterRLine = () => (
        <div style={{width: '100%', height: '300px'}}>
            <ResponsiveLine
                data={data}
                margin={{ top: 10, right: 30, bottom: 60, left: 60 }}
                xScale={{ type: 'point' }}
                yScale={{ type: 'linear', min: 0, max: 5, stacked: false, reverse: false }}
                axisBottom={{
                    tickSize: 5,
                    tickPadding: 8,
                    tickRotation: -15
                }}
                axisLeft={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                    legend: 'GPA',
                    legendOffset: -40,
                    legendPosition: 'middle'
                }}
                colors={{ scheme: 'set1' }}
                pointSize={10}
                pointLabel="y"
                useMesh={true}
                legends={[
                    {
                        anchor: 'bottom',
                        direction: 'row',
                        justify: false,
                        translateY: 55,
                        itemsSpacing: 0,
                        itemDirection: 'left-to-right',
                        itemWidth: 100,
                        itemHeight: 20,
                        symbolSize: 12,
                        symbolShape: 'circle',
                        symbolBorderColor: 'rgba(0, 0, 0, .5)'
                    }
                ]}
            />
        </div>
    );

    return (
        <div className='trends-card'>
            <div className='page-header' style={{marginBottom: '0.25rem'}}>Transcript Trends</div>
            <div>Semester versus GPA</div>
            <GPAvSemesterRLine />
        </div>
    );
}

export default Trends;