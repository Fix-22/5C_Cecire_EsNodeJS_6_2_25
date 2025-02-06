(async () => {
    const inputFile = document.querySelector('#file');
    const inputDescription = document.querySelector("#description");
    const button = document.querySelector("#button");
    const linkList = document.querySelector("#linkList");
    const error = document.querySelector("#error");

    const renderLinkList = async () => {
        const res = await fetch("/filelist");
        const data = await res.json();
        
        const template = '<li><a href="%LINK" target="_blank">%LINK</a></li>';
        let rows = "";

        data.filelist.forEach(e => {
            rows += template.replaceAll("%LINK", e);
        });
        linkList.innerHTML = rows;
    };
  
    const handleSubmit = async () => {
        if (description.value && inputFile.files.length > 0) {
            error.innerText = "";

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
                await renderLinkList();
            } 
            catch (e) {
                console.log(e);
            }
        }
        else {
            error.innerText = "Inserire file e/o descrizione!";
        }
    }
    
    await renderLinkList();
    button.onclick = handleSubmit;
})();