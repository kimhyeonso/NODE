document.getElementById("enter").addEventListener("click", function(){
    
    let id = document.getElementById("id").value;
    let passWord = document.getElementById("passWord").value;
    let errorMsg = document.getElementById("errorMsg");

    if(id === "" || passWord === ""){
        errorMsg.textContent = "아이디와 비밀번호를 입력해주세요.";
        return;
    }

    let savedId = localStorage.getItem("userId");
    let savedPw = localStorage.getItem("userPw");

    if(id === savedId && passWord === savedPw){
        localStorage.setItem("isLoggedIn", "true");
        window.location.href = "./index.html";
    } else {
        errorMsg.textContent = "아이디 또는 비밀번호가 틀렸습니다.";
    }
});

//키보드로 엔터치기
document.addEventListener("keydown", function(e){
    if(e.key === "Enter"){
        document.getElementById("enter").click();
    }
});

//비밀번호 찾기로 이동하기
document.getElementById("findBtn").addEventListener("click", function(){
    window.location.href = "./find.html";
});
