// /* eslint-disable no-unused-vars */
// import React, { useState, forwardRef, useImperativeHandle } from 'react';
// import PropTypes from 'prop-types'; // Importez PropTypes depuis la bibliothèque prop-types
// import axios from 'axios';
// import FormData from "form-data";
// import "./../App.css";

// /* eslint-disable react/display-name */
// const CreatepipelineForm = forwardRef(({ projectUrl , gitlabUrl, jenkinsUrl , jenkinsUsername , sonarUrl , branchName ,credentialsId }, ref) => {
//     const [response, setResponse] = useState(null);
//     const [loading, setLoading] = useState(false); // State pour gérer l'affichage de "En attente..."
  
//     const handleCreatepipelineForm = async (event) => {
//         const apiUrl = import.meta.env.VITE_APP_API_URL;
    
//         let data = new FormData();
//         data.append('project_url', projectUrl);
//         data.append('gitlab_url', gitlabUrl);
//         data.append('sonar_url', sonarUrl);
//         data.append('jenkins_url', jenkinsUrl);
//         data.append('jenkins_username', jenkinsUsername);
//         data.append('branchName', branchName);
//         data.append('credentialsId', credentialsId);
    
//         let config = {
//             method: 'post',
//             url: `${apiUrl}create_pipelinee`,
//             headers: { 
//                 'Content-Type': 'multipart/form-data'
//             },
//             data : data
//         };

//         try {
//             setLoading(true); // Activer le chargement "En attente..."
//             const response = await axios(config);
//             setResponse(JSON.stringify(response.data));
//         } catch (error) {
//             console.log(error);
//         } finally {
//             setLoading(false); // Désactiver le chargement une fois l'exécution terminée
//         }

//     };
  
//     useImperativeHandle(ref, () => ({
//         handleCreatepipelineForm
//     }));
//     return (
//         <header>
//             <form onSubmit={handleCreatepipelineForm}>        
//             </form>
//             {loading && <h4>En attente... Build en cours</h4>}
//             {response && <h4><pre>{response}</pre></h4>}

//         </header>
//     );
// });

// // Ajoutez la validation des props
// CreatepipelineForm.propTypes = {
//     projectUrl: PropTypes.string.isRequired,
//     gitlabUrl: PropTypes.string.isRequired,
//     jenkinsUrl: PropTypes.string.isRequired,
//     jenkinsUsername: PropTypes.string.isRequired,
//     sonarUrl: PropTypes.string.isRequired,
//     branchName: PropTypes.string.isRequired,
//     credentialsId: PropTypes.string.isRequired
// };

// export default CreatepipelineForm;



import React, { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import axios from 'axios';
import FormData from "form-data";
import "./Apps.css";

const CreatePipelineForm = forwardRef(({ projectUrl, jenkinsUrl, jenkinsUsername, sonar_url, branchName, credentialsId }, ref) => {
    const [response, setResponse] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    // const [build_status, setBuildStatus] = useState(null); 


    useEffect(() => {
        const eventSource = new EventSource('/create_pipelinee');
        eventSource.onmessage = function (event) {
            const result = JSON.parse(event.data);
            console.log(result);
            setResponse(JSON.stringify(result));

            //Check if the event data contains build_status and update the state accordingly
            if (result.hasOwnProperty('build_status')) {
                setBuildStatus(result.build_status);
            } else {
                setResponse(JSON.stringify(result));
            }
        };

        return () => {
            eventSource.close();
        };
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);


        const apiUrl = import.meta.env.VITE_APP_API_URL;

        let data = new FormData();
        data.append('project_url', projectUrl);
        data.append('sonar_url', sonar_url);
        data.append('jenkins_url', jenkinsUrl);
        data.append('jenkins_username', jenkinsUsername);
        data.append('branchName', branchName);
        data.append('credentialsId', credentialsId);

        let config = {
            method: 'post',
            url: `${apiUrl}/create_pipelinee`,
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            data: data
        };

        try {
            const response = await axios(config);
            setResponse(JSON.stringify(response.data));
            setIsSubmitting(false);
        } catch (error) {
            console.error(error);
        }
    };

    useImperativeHandle(ref, () => ({
        handleSubmit
    }));

    return (
        <header className='repo'>
            <form onSubmit={handleSubmit}>
                {/* Form inputs and submit button here */}
            </form>

            {isSubmitting ? (
                <h4><pre>Build in progress...</pre></h4>
            ) : (
                response && <h4><pre>{response}</pre></h4>
            )}

        </header>
    );
});

export default CreatePipelineForm;




