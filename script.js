document.addEventListener('DOMContentLoaded', function() {
    let prompt = document.getElementById('prompt');
    let chatArea = document.getElementsByClassName('chat-container')[0];
    let imageBtn = document.getElementById('image');
    let submitBtn = document.getElementById('submit');
    let image = document.querySelector('#image img');
    let imageInp = document.querySelector("#image input")

    let api_url = "http://localhost:5000/api/gemini"; 

    
    let user = {
        message : "",
        file : {
            mime_type :null,
            data: null
        }
    };

    function handleAiChatResponse(message){
        let aiChatArea = chatArea.lastChild.querySelector('.ai-chat-area');
        aiChatArea.innerHTML = message;

    }

    async function generateResponse() {
        let obj = {
            headers: { 'Content-Type': 'application/json' },
            method: 'POST',
            body: JSON.stringify({
                contents: [
                    {
                        parts:[
                            {
                            text: user.message
                            },
                            (user.file.data? {
                                inline_data : user.file
                            
                            }:[])
                        ]
                    }
                ]
            })
        };

        try{
            let response = await fetch(api_url, obj);
            let data = await response.json();
            let aiRes = data.candidates[0].content.parts[0].text.replace(/\*/g, " ").trim();

            handleAiChatResponse(aiRes);
        }
        catch(error){
            console.log(error);
        }
        finally{
            chatArea.scrollTo({top:chatArea.scrollHeight, behavior:"smooth"})
            user.file = {}
        }
    }
    
    function handleChatResponse(messege){
        user.message = messege;
        let html = `<img src="assets/user_image.png" id="userImg" width="60">
                    <div class="user-chat-area">
                    ${user.file.data? `<img src = "data:${user.file.mime_type};base64,${user.file.data}" class = "chooseimg" /> ` : ""}
                    ${messege}</div>`;
        
        let userChatBox = document.createElement('div');
        userChatBox.classList.add("user-chat-box");
        userChatBox.innerHTML = html;
        chatArea.appendChild(userChatBox);

        chatArea.scrollTo({top:chatArea.scrollHeight, behavior:"smooth"})

       // for Ai
        setTimeout(() => {
            let html2 = `<img src="assets/Ai_image.png" alt="" id="aiImg" width="45">
                        <div class="ai-chat-area">
                            <video width="70px" autoplay loop muted>
                                <source src="assets/Animation - 1740416735971.webm" type="video/webm">
                            </video>
                        </div>`
            
            let aiChatBox = document.createElement('div');
            aiChatBox.classList.add("ai-chat-box");
            aiChatBox.innerHTML = html2;
            chatArea.appendChild(aiChatBox);
        }, 500);

        image.src = "assets/image.svg";
        if(image.classList.contains('choosenImg')) image.classList.remove('choosenImg');
        if(user.data != "") generateResponse();    

    }

    prompt.addEventListener('keydown', function(e) {
        if(e.key === 'Enter') {
            let command = prompt.value;
            prompt.value = "";
            if(command!= "") handleChatResponse(command);
        }
    });

    submitBtn.addEventListener('click', function(e) {
        let command = prompt.value;
        prompt.value = "";
        if(command!= "") handleChatResponse(command);

    });


    imageInp.addEventListener("change", ()=>{
        const file = imageInp.files[0];
        if(!file) return;
        
        let reader = new FileReader()
        addListeners(reader);
        reader.readAsDataURL(file);

        function addListeners(reader){
            reader.addEventListener("load", (e)=>{
                // console.log(e)
                let base64String = e.target.result.split(",")[1];
                // console.log(base64String);
                user.file= {
                    mime_type : file.type,
                    data : base64String
                }
                // console.log(user.file);

                image.src = `data:${user.file.mime_type};base64,${user.file.data}`
                image.classList.add("choosenImg");
            });
        }    

    });

    imageBtn.addEventListener("click", ()=>{
        imageInp.click();
    });

});

