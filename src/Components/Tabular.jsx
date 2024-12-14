import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import 'tabulator-tables/dist/css/tabulator.min.css';
import { TabulatorFull as Tabulator } from 'tabulator-tables';

const Tabular = () => {
  const tablereference = useRef(null);
  const tableInstance = useRef(null); // This will store the Tabulator instance
  const [taskdatavalue, settaskdatavalue] = useState([]);
  const [filterstatus, setfilterstatus] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("https://jsonplaceholder.typicode.com/todos?_limit=20");
        const dataSample = response.data.map(data => ({
          id: data.id,
          title: data.title,
          status: data.completed ? 'Done' : 'To Do',
        }));
        settaskdatavalue(dataSample);
      } catch (error) {
        console.error(error.message);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (taskdatavalue.length > 0) {
      tableInstance.current = new Tabulator(tablereference.current, {
        data: taskdatavalue,
        layout: 'fitColumns',
        columns: [
          { title: 'Task ID', field: 'id', width: 70 },
          { title: 'Title', field: 'title', editor: 'input' },
          {
            title: 'Status',
            field: 'status',
            editor: 'select',
            editorParams: { values: ['To Do', 'In Progress', 'Done'] }, // here this are the parameter of editor 
          },
          {
            title: 'Actions',
            formatter: function () {
              return "<button style='background-color: yellow; color: black; border: none; padding: 5px 10px; border-radius: 5px;'>Delete</button>";
            },
            cellClick: function (e, cell) {
              cell.getRow().delete();
            },
          },
        ],
      });

      if (filterstatus) {
        tableInstance.current.setFilter('status', '=', filterstatus);
      }

      return () => tableInstance.current?.destroy();
    }
  }, [taskdatavalue, filterstatus]);

  const addTask = () => {
    const newTask = {
      id: taskdatavalue.length + 1,
      title: 'New Task',
      status: 'To Do',
    };
    settaskdatavalue(prevTasks => {
      const updatedTasks = [...prevTasks, newTask]; 
      if (tableInstance.current) {  
        tableInstance.current.setData(updatedTasks); 
      }
      return updatedTasks;
    });
  };

  const handleFilterChange = (e) => {
    const filterValue = e.target.value;
    setfilterstatus(filterValue);

 
    if (tableInstance.current) {
      if (filterValue) {
        tableInstance.current.setFilter('status', '=', filterValue);
      } else {
        tableInstance.current.clearFilter();
      }
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <button
          onClick={addTask}
          style={{ padding: '10px 20px', backgroundColor: '#4caf50', color: 'white', border: 'none', borderRadius: '5px' }}
        >
          Add New Task
        </button>
        <select onChange={handleFilterChange} style={{ padding: '10px 20px' }}>
          <option value=''>All</option>
          <option value='To Do'>To Do</option>
          <option value='In Progress'>In Progress</option>
          <option value='Done'>Done</option>
        </select>
      </div>
      <div ref={tablereference} />
    </div>
  );
};

export default Tabular;
