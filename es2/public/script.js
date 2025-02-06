(async () => {
    const inputFile = document.querySelector('#file');
    const inputDescription = document.querySelector("#description");
    const button = document.querySelector("#button");
    const link = document.querySelector("#link");
  
    handleSubmit = async (event) => {
        const formData = new FormData();
        formData.append("file", inputFile.files[0]);
        const body = formData;
        body.description = inputDescription.value;
        
        const fetchOptions = {
            method: 'post',
            body: body
        };

        try {
            const res = await fetch("/upload", fetchOptions);
            const data = await res.json();
            link.setAttribute("href", data.url);
            link.innerText = data.url;
        } 
        catch (e) {
            console.log(e);
        }
    }
  
    button.onclick = handleSubmit;
})();