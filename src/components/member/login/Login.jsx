import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import axios from "axios";
import Footer from "../../common/Footer.jsx";
import { KAKAO_AUTH_URL } from "../../../service/kakaologin.js";
import KakaoIMG from "../../../assets/images/kakao_login_large_narrow.png";
import {
  BORDERDIV,CHKDIV,CHKINPUT,LDIV,LDIV2,LDIV3,LDIV4,
  LINPUT,LOGINBTN,LOGINDIV,
  LSPAN,REGISTERLINK,SOCIALBTN,SOCIALDIV,VALIDDIV,LJOIN,
} from "../../../assets/styles/Login/LoginStyle.js";
import "../../../assets/styles/Login/LoginStyle.css";

const LoginPage = ({ isLogin, setIsLogin, logout}) => {
  const navigate = useNavigate();
  const [customerId, setCustomerId] = useState(""); // 아이디 상태
  const [password, setPassword] = useState(""); // 비밀번호 상태
  const [isIdValid, setIsIdValid] = useState(false); // 아이디 유효성 검증
  const [idMessage, setIdMessage] = useState(""); // 아이디 에러 메시지
  const [isCheck, setIsCheck] = useState(false); // "자동로그인" 체크박스 상태

  // 팝업 상태 관리
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupMessage, setPopupMessage] = useState(""); // 팝업 메시지

  // 팝업 열기
  const openPopup = (message) => {
    setPopupMessage(message);
    setIsPopupOpen(true);
  };

  // 팝업 닫기
  const closePopup = (e) => {
    if (!e || e.type === "click" || (e.type === "keydown" && e.key === "Enter")) {
      setIsPopupOpen(false);
    }
  };

  // 아이디 변경 이벤트
  const handleIdChange = (e) => {
    const value = e.target.value;
    setCustomerId(value);

    const idRegex = /^[A-Za-z][A-Za-z0-9]{2,20}$/; // 아이디 유효성 검사
    if (!value || !idRegex.test(value)) {
      setIsIdValid(false);
      setIdMessage("아이디는 2~20자의 영문자와 숫자로만 입력 가능합니다.");
    } else {
      setIsIdValid(true);
      setIdMessage("올바른 아이디 형식입니다.");
    }
  };

  // 비밀번호 변경 이벤트
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  // "자동로그인" 체크박스 상태 변경
  const handleCheckChange = (e) => {
    setIsCheck(e.target.checked);
  };

  // 로그인 요청
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:8080/user/login",
        { id: customerId, password },
        { withCredentials: true } // 쿠키 포함
      );

      console.log("응답 데이터:", response.data); // 응답 로그
      
      if (response.status === 200) {
        // 로그인 성공
        const { token } = response.data;

        sessionStorage.setItem("accessToken", token); // 세션 스토리지에 JWT 저장
        setIsLogin(true);
        // "자동로그인" 상태라면 쿠키 저장
        if (isCheck) {
          Cookies.set("accessToken", token, { expires: 7 });
        } else {
          Cookies.remove("accessToken");
        }

        openPopup("로그인 성공 ~ 환영합니다 :)")

      } else {
        openPopup("로그인 실패: 아이디 또는 비밀번호를 확인하세요.");
      }
    } catch (error) {
      console.error("로그인 에러:", error);
      if (error.response?.status === 401) {
        openPopup("아이디와 비밀번호가 일치하지 않습니다.");
      } else {
        const errorMessage =
          error.response?.data?.message || "로그인 요청 중 문제가 발생했습니다.";
        openPopup(errorMessage);
      }
    }
  };

  // Enter 키로 로그인
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && isIdValid && password) {
      handleLogin(e); // Enter 키로 로그인
    }
  };

  return (
    <>
      <br />
      <LDIV>
        <LSPAN>로그인</LSPAN>
        <LDIV3>
          <LDIV4>
            <LDIV2>
              <LINPUT
                type="text"
                placeholder="아이디"
                value={customerId}
                onChange={handleIdChange}
                onKeyDown={handleKeyDown} // Enter 키 이벤트 추가
              />
              {customerId.length > 0 && (
                <VALIDDIV className={`message ${isIdValid ? "success" : "error"}`}>
                  {idMessage}
                </VALIDDIV>
              )}
            </LDIV2>
            <LDIV2>
              <LINPUT
                type="password"
                placeholder="비밀번호"
                value={password}
                onChange={handlePasswordChange}
                onKeyDown={handleKeyDown} // Enter 키 이벤트 추가
              />
            </LDIV2>
          </LDIV4>

          <CHKDIV>
            <CHKINPUT
              type="checkbox"
              checked={isCheck}
              onChange={handleCheckChange}
              id="autologin"
            />
            <label htmlFor="autologin">자동로그인</label>
            <REGISTERLINK to="/findidpass">아이디 | 비밀번호 찾기</REGISTERLINK>
          </CHKDIV>

          <LOGINDIV>
            <LOGINBTN onClick={handleLogin} disabled={!isIdValid || !password}>
              로그인
            </LOGINBTN>
          </LOGINDIV>
          <BORDERDIV>SNS 계정으로 간편 로그인</BORDERDIV>
          <SOCIALDIV>
            <a href={KAKAO_AUTH_URL}>
              <SOCIALBTN src={KakaoIMG} alt="카카오 로그인" />
            </a>
          </SOCIALDIV>

          <LJOIN onClick={() => navigate("/register")}>회원가입</LJOIN>
        </LDIV3>
      </LDIV>
      <br />
      <Footer />

      {/* 팝업 알림 */}
      {isPopupOpen && (
        <div
          className="popup-overlay"
          onClick={closePopup}
          tabIndex={0}
          role="button"
        >
          <div className="popup">
            <div className="popup-content">
              {popupMessage}
              <br />
              <br />
              <button
                onClick={closePopup}
                className="btn btn-primary"
                onKeyDown={handleKeyDown}
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LoginPage;
