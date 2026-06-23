document.getElementById("pwFind").addEventListener("click", function(){
    let name = document.getElementById("findName").value;
    let id = document.getElementById("findId").value;
    let errorMsg = document.getElementById("errorMsg");

    if(name === "" || id === ""){
        errorMsg.textContent = "모든 항목을 입력해주세요.";
        return;
    }

    let savedName = localStorage.getItem("userName");
    let savedId = localStorage.getItem("userId");

    if(name === savedName && id === savedId){
        window.location.href = "./changePw.html";
    } else {
        errorMsg.textContent = "일치하는 회원 정보가 없습니다.";
    }
});

//키보드 엔터치기
document.addEventListener("keydown", function(e){
    if(e.key === "Enter"){
        document.getElementById("pwFind").click();
    }
});