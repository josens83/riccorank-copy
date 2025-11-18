'use client';

import { useThemeStore } from '@/lib/store';
import Link from 'next/link';

export default function PrivacyPage() {
  const { isDarkMode } = useThemeStore();

  return (
    <main className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} py-12`}>
      <div className="max-w-4xl mx-auto px-4">
        <div className={`rounded-lg border ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } p-8`}>
          <h1 className={`text-3xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            개인정보처리방침
          </h1>

          <div className={`space-y-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <section>
              <p className="mb-4">
                RANKUP(이하 "회사")는 정보통신망 이용촉진 및 정보보호 등에 관한 법률, 개인정보보호법 등 관련 법령상의
                개인정보보호 규정을 준수하며, 관련 법령에 의거한 개인정보처리방침을 정하여 이용자 권익 보호에 최선을 다하고 있습니다.
              </p>
            </section>

            <section>
              <h2 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                1. 수집하는 개인정보의 항목
              </h2>
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold mb-2">가. 회원가입 시</h3>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li><strong>필수항목:</strong> 이메일 주소, 비밀번호, 이름</li>
                    <li><strong>선택항목:</strong> 프로필 사진, 생년월일</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">나. 소셜 로그인 시 (Google)</h3>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>이메일 주소, 이름, 프로필 사진</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">다. 서비스 이용 시 자동 수집</h3>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>IP주소, 쿠키, 서비스 이용 기록, 접속 로그, 기기 정보</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                2. 개인정보의 수집 및 이용목적
              </h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>회원 관리:</strong> 회원제 서비스 제공, 본인 확인, 개인 식별, 불량회원의 부정 이용 방지</li>
                <li><strong>서비스 제공:</strong> 맞춤 서비스 제공, 콘텐츠 제공, 본인인증, 구매 및 요금 결제</li>
                <li><strong>마케팅 및 광고:</strong> 신규 서비스 개발 및 맞춤 서비스 제공, 이벤트 및 광고성 정보 제공</li>
                <li><strong>서비스 개선:</strong> 통계 분석, 서비스 개선 및 신규 서비스 개발</li>
              </ul>
            </section>

            <section>
              <h2 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                3. 개인정보의 보유 및 이용기간
              </h2>
              <div className="space-y-3">
                <p>
                  회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보
                  보유·이용기간 내에서 개인정보를 처리·보유합니다.
                </p>
                <div>
                  <h3 className="font-semibold mb-2">가. 회원 탈퇴 시</h3>
                  <p>회원 탈퇴 즉시 파기. 단, 관계 법령에 의한 정보보유 사유가 있을 경우 해당 기간 동안 보관</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">나. 법령에 의한 보유</h3>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>계약 또는 청약철회 등에 관한 기록: 5년 (전자상거래법)</li>
                    <li>대금결제 및 재화 등의 공급에 관한 기록: 5년 (전자상거래법)</li>
                    <li>소비자의 불만 또는 분쟁처리에 관한 기록: 3년 (전자상거래법)</li>
                    <li>웹사이트 방문기록: 3개월 (통신비밀보호법)</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                4. 개인정보의 제3자 제공
              </h2>
              <p>
                회사는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다. 다만, 아래의 경우에는 예외로 합니다.
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1 mt-2">
                <li>이용자가 사전에 동의한 경우</li>
                <li>법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
              </ul>
            </section>

            <section>
              <h2 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                5. 개인정보의 파기
              </h2>
              <div className="space-y-3">
                <p>
                  회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체 없이 해당 개인정보를 파기합니다.
                </p>
                <div>
                  <h3 className="font-semibold mb-2">파기절차</h3>
                  <p>
                    이용자가 입력한 정보는 목적 달성 후 별도의 DB에 옮겨져 내부 방침 및 기타 관련 법령에 따라
                    일정기간 저장된 후 혹은 즉시 파기됩니다.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">파기방법</h3>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>전자적 파일 형태: 복구 및 재생되지 않도록 안전하게 삭제</li>
                    <li>종이 문서: 분쇄기로 분쇄하거나 소각</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                6. 이용자 및 법정대리인의 권리와 그 행사방법
              </h2>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>이용자는 언제든지 등록되어 있는 자신의 개인정보를 조회하거나 수정할 수 있습니다.</li>
                <li>이용자는 언제든지 회원 탈퇴를 통해 개인정보의 수집 및 이용 동의를 철회할 수 있습니다.</li>
                <li>만 14세 미만 아동의 경우, 법정대리인이 아동의 개인정보를 조회하거나 수정, 삭제, 처리정지 요구를 할 수 있습니다.</li>
              </ul>
            </section>

            <section>
              <h2 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                7. 개인정보 보호책임자
              </h2>
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} mt-3`}>
                <p><strong>개인정보 보호책임자</strong></p>
                <ul className="mt-2 space-y-1">
                  <li>이름: 홍길동</li>
                  <li>직책: 개인정보보호책임자</li>
                  <li>이메일: privacy@rankup.com</li>
                </ul>
              </div>
              <p className="mt-3">
                기타 개인정보침해에 대한 신고나 상담이 필요하신 경우에는 아래 기관에 문의하시기 바랍니다.
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1 mt-2">
                <li>개인정보침해신고센터 (privacy.kisa.or.kr / 국번없이 118)</li>
                <li>대검찰청 사이버범죄수사단 (www.spo.go.kr / 국번없이 1301)</li>
                <li>경찰청 사이버안전국 (cyberbureau.police.go.kr / 국번없이 182)</li>
              </ul>
            </section>

            <section>
              <h2 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                8. 개인정보 처리방침의 변경
              </h2>
              <p>
                본 개인정보처리방침은 법령·정책 또는 보안기술의 변경에 따라 내용의 추가·삭제 및 수정이 있을 시에는
                변경되는 개인정보처리방침을 시행하기 최소 7일 전에 홈페이지를 통해 변경사유 및 내용 등을 공지하도록 하겠습니다.
              </p>
            </section>

            <section>
              <h2 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                9. 쿠키(Cookie)의 운영 및 거부
              </h2>
              <div className="space-y-3">
                <p>
                  회사는 이용자에게 개별적인 맞춤서비스를 제공하기 위해 이용 정보를 저장하고 수시로 불러오는 '쿠키(cookie)'를 사용합니다.
                </p>
                <div>
                  <h3 className="font-semibold mb-2">쿠키의 사용 목적</h3>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>방문 및 이용형태, 인기 검색어, 보안접속 여부 등을 파악하여 최적화된 서비스 제공</li>
                    <li>맞춤형 서비스 제공</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">쿠키의 설치/운영 및 거부</h3>
                  <p>
                    이용자는 쿠키 설치에 대한 선택권을 가지고 있습니다. 웹브라우저에서 옵션을 설정함으로써 모든 쿠키를 허용하거나,
                    쿠키가 저장될 때마다 확인을 거치거나, 모든 쿠키의 저장을 거부할 수 있습니다.
                  </p>
                </div>
              </div>
            </section>

            <section className="pt-6 border-t border-gray-300 dark:border-gray-600">
              <p className="text-sm">
                <strong>공고일자:</strong> 2024년 1월 1일<br />
                <strong>시행일자:</strong> 2024년 1월 1일
              </p>
            </section>

            <div className="mt-8 pt-6 border-t border-gray-300 dark:border-gray-600">
              <Link
                href="/"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                홈으로 돌아가기
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
