import React, { useState, useEffect } from 'react';
import {Button, Col, Form, Row} from "react-bootstrap";
const ReservationService = require("../../../services/ReservationService");

const TableButton = ({data,selectedTable,onButtonSelect})=>{
    console.log("TableData->"+JSON.stringify(data));
    const [selectedTableData, setSelectedTableData] = useState();
    const handleTableButtonClick = (event,tableName) => {
        event.preventDefault();
        setSelectedTableData(tableName);
        onButtonSelect(event,tableName); // Notify parent component about the selected slot
        console.log("selected TableName =>"+selectedTableData);
    };

    return (
        <Form.Group as={Row} className="mb-3" >
            <Form.Label column sm="3">
                Table
            </Form.Label>
            <Col sm="10" >
                { data && Object.entries(data).map(([tableName, capacity])=> (
                    <Button
                        key={tableName}
                        // disabled={table}
                        name="tableName"
                        className={`btn  btn-warning `}
                        onClick={(event) => handleTableButtonClick(event,tableName)}
                        style={{ margin: '5px' }}
                        active={tableName === selectedTable}
                        // active={slot.start === selectedSlot.start && slot.end === selectedSlot.end}
                    >
                        Table-{tableName} Capacity-{capacity}
                    </Button>
                ))}
            </Col>
        </Form.Group>

    );
}

export default TableButton;
