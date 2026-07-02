document.getElementById("signupCheck").addEventListener("click", function(){
    
    let name = document.getElementById("name").value;
    let id = document.getElementById("id").value;
    let passWord = document.getElementById("passWord").value;
    let passWordCheck = document.getElementById("passWordCheck").value;

    // 정규식
    let emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let phoneRegex = /^01[0-9]{9}$/;

    // 에러 메시지 초기화
    document.getElementById("nameError").textContent = "";
    document.getElementById("idError").textContent = "";
    document.getElementById("pwError").textContent = "";
    document.getElementById("pwCheckError").textContent = "";

    let isValid = true;

    if(name === ""){
        document.getElementById("nameError").textContent = "이름을 입력해주세요.";
        isValid = false;
    }
    if(id === ""){
        document.getElementById("idError").textContent = "전화번호 혹은 이메일을 입력해주세요.";
        isValid = false;
    } else if(!emailRegex.test(id) && !phoneRegex.test(id)){
        document.getElementById("idError").textContent = "올바른 이메일 또는 전화번호를 입력해주세요.";
        isValid = false;
    }
    if(passWord === ""){
        document.getElementById("pwError").textContent = "비밀번호를 입력해주세요.";
        isValid = false;
    }
    if(passWordCheck === ""){
        document.getElementById("pwCheckError").textContent = "비밀번호 확인을 입력해주세요.";
        isValid = false;
    }
    if(passWord !== "" && passWordCheck !== "" && passWord !== passWordCheck){
        document.getElementById("pwCheckError").textContent = "비밀번호가 일치하지 않습니다.";
        isValid = false;
    }

    if(!isValid) return;

    localStorage.setItem("userId", id);
    localStorage.setItem("userPw", passWord);
    localStorage.setItem("userName", name);

    //회원가입되면 바로 로그인 창으로 이동
    window.location.href = "./login.html";
});

// 키보드 엔터 적용
document.addEventListener("keydown", function(e){
    if(e.key === "Enter"){
        document.getElementById("signupCheck").click();
    }
});

//뒤로가기 버튼 구현하기
document.getElementById('backBtn').addEventListener('click', () => {
  document.querySelector('.signupBox').classList.add('fadeOut');
  setTimeout(() => {
    location.href = './login.html';
  }, 300);
});

//닫기 버튼 구현하기
document.getElementById('closeBtn').addEventListener('click', () => {
  location.href = './index.html';
});