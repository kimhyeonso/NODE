document.getElementById("signupCheck").addEventListener("click", function(){
    
    let name = document.getElementById("name").value;
    let id = document.getElementById("id").value;
    let passWord = document.getElementById("passWord").value;
    let passWordCheck = document.getElementById("passWordCheck").value;

    // 빈칸 체크
    if(name === "" || id === "" || passWord === "" || passWordCheck === ""){
        alert("모든 항목을 입력해주세요.");
        return;
    }

    // 비밀번호 일치 체크
    if(passWord !== passWordCheck){
        alert("비밀번호가 일치하지 않습니다.");
        return;
    }

    // 로컬스토리지에 저장
    localStorage.setItem("userId", id);
    localStorage.setItem("userPw", passWord);
    localStorage.setItem("userName", name);

    alert("회원가입이 완료되었습니다.");
    window.location.href = "./login.html";

});

//키보드 엔터
document.addEventListener("keydown", function(e){
    if(e.key === "Enter"){
        document.getElementById("signupCheck").click();
    }
});