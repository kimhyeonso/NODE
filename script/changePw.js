document.getElementById("resetBtn").addEventListener("click", function(){
    let newPw = document.getElementById("newPw").value;
    let newPwCheck = document.getElementById("newPwCheck").value;

    if(newPw === "" || newPwCheck === ""){
        alert("새 비밀번호를 입력해주세요.");
        return;
    }

    if(newPw !== newPwCheck){
        alert("비밀번호가 일치하지 않습니다.");
        return;
    }

    localStorage.setItem("userPw", newPw);
    alert("비밀번호가 변경되었습니다.");
    window.location.href = "./login.html";
});

document.addEventListener("keydown", function(e){
    if(e.key === "Enter"){
        document.getElementById("resetBtn").click();
    }
});