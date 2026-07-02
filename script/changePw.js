document.getElementById("changeBtn").addEventListener("click", function(){
    let newPw = document.getElementById("newPw").value;
    let newPwCheck = document.getElementById("newPwCheck").value;

    document.getElementById("pwError").textContent = "";
    document.getElementById("pwCheckError").textContent = "";

    let isValid = true;

    if(newPw === ""){
        document.getElementById("pwError").textContent = "새 비밀번호를 입력해주세요.";
        isValid = false;
    }
    if(newPwCheck === ""){
        document.getElementById("pwCheckError").textContent = "비밀번호 확인을 입력해주세요.";
        isValid = false;
    }
    if(newPw !== "" && newPwCheck !== "" && newPw !== newPwCheck){
        document.getElementById("pwCheckError").textContent = "비밀번호가 일치하지 않습니다.";
        isValid = false;
    }

    if(!isValid) return;

    alert("비밀번호가 변경되었습니다.");
    document.querySelector('.changeBox').classList.add('fadeOut');
    setTimeout(() => {
        localStorage.setItem("userPw", newPw);
        window.location.href = "./login.html";
    }, 300);
});

//키보드 엔터 키 적용
document.addEventListener("keydown", function(e){
    if(e.key === "Enter"){
        document.getElementById("changeBtn").click();
    }
});

//닫기
document.getElementById('closeBtn').addEventListener('click', () => {
  location.href = './index.html';
});


//뒤로가기
document.getElementById('backBtn').addEventListener('click', () => {
  document.querySelector('.changeBox').classList.add('fadeOut');
  setTimeout(() => {
    location.href = './find.html';
  }, 300);
});