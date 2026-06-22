document.getElementById("enter").addEventListener("click", function(){
    
    let id = document.getElementById("id").value;
    let passWord = document.getElementById("passWord").value;

    // 빈칸 체크
    if(id === "" || passWord === ""){
        alert("아이디와 비밀번호를 입력해주세요.");
        return;
    }

    // 로컬스토리지에 저장된 값과 비교
    let savedId = localStorage.getItem("userId");
    let savedPw = localStorage.getItem("userPw");

    if(id === savedId && passWord === savedPw){
        alert("로그인 성공!");
        window.location.href = "./index.html";
    } else {
        alert("아이디 또는 비밀번호가 틀렸습니다.");
    }

    
});

//키보드 엔터
document.addEventListener("keydown", function(e){
    if(e.key === "Enter"){
        document.getElementById("enter").click();
    }
});

//비밀번호 찾기 페이지로 이동
document.getElementById("findBtn").addEventListener("click", function(){
    window.location.href = "./find.html";
})