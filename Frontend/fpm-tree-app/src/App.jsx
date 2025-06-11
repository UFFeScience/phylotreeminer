import React, { useEffect,useState } from 'react';
import { Button, Result } from 'antd';
import ProjectsList from './components/displayData/projectsList';
import ProjectExplorer from './components/displayData/projectExplorer';

function App() {
  const [projects, setProjects] = useState([]);
  const [inputData, setInputData] = useState([]);


  useEffect(() => {
    fetch('http://localhost:8000/projects')
      .then(response => response.json())
      .then(data => setProjects(data))
      .catch(error => console.error('Error fetching projects:', error));

    fetch('http://localhost:8000/inputs_data')
      .then(response => response.json())
      .then(data => setInputData(data))
      .catch(error => console.error('Error fetching projects:', error));
  }, []);

  return (
    <div style={{padding: 0, margin: 0, height: '100vh', width: '100vw'}}>
      {/* <Result
        status="404"
        title="404"
        subTitle="Sorry, the page you visited does not exist."
        extra={<Button type="primary">Back Home</Button>}
      /> */}

      <ProjectsList projects={projects}/>
      <ProjectsList projects={inputData}/>
      <ProjectExplorer />
    </div>
  );
}

export default App;