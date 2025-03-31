import React from 'react';
import Head from 'next/head';
import styles from '@/styles/learn-more/team.module.css';
import Link from 'next/link';

const TeamPage = () => {
  return (
    <>
      <Head>
        <title>CookiesCooker - Đội ngũ phát triển đa năng</title>
        <meta name="description" content="Gặp gỡ CookiesCooker - Đội ngũ trẻ với đa dạng kỹ năng công nghệ" />
      </Head>

      <div className={styles.container}>

        <div className={styles.backButtonContainer}>
          <Link href="/" className={styles.backButton}>
            ← Trở về trang chủ
          </Link>
        </div>
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              Xin chào! Chúng tôi là <span className={styles.highlight}>CookiesCooker</span>
            </h1>
            <p className={styles.heroSubtitle}>
              Đội ngũ đa năng với các chuyên môn bổ trợ cho nhau
            </p>
            <div className={styles.heroDecoration}>
              <div className={styles.cookieIcon}>🍪</div>
              <div className={styles.codeIcon}>{"</>"}</div>
            </div>
          </div>
        </section>

        {/* Core Values Section */}
        <section className={styles.valuesSection}>
          <div className={styles.sectionContent}>
            <h2 className={styles.sectionTitle}>Giá trị cốt lõi</h2>
            <div className={styles.valuesGrid}>
              <div className={styles.valueCard}>
                <div className={styles.valueIcon}>✨</div>
                <h3>Đa năng - Linh hoạt</h3>
                <p>Mỗi thành viên đều có thể đảm nhiệm nhiều vai trò khác nhau</p>
              </div>
              <div className={styles.valueCard}>
                <div className={styles.valueIcon}>🤝</div>
                <h3>Hỗ trợ lẫn nhau</h3>
                <p>Luôn sẵn sàng chia sẻ kiến thức và giúp đỡ đồng đội</p>
              </div>
              <div className={styles.valueCard}>
                <div className={styles.valueIcon}>🚀</div>
                <h3>Cải tiến không ngừng</h3>
                <p>Không ngừng học hỏi và nâng cao kỹ năng</p>
              </div>
            </div>
          </div>
        </section>

        {/* Team Members */}
        <section className={styles.teamSection}>
          <div className={styles.sectionContent}>
            <h2 className={styles.sectionTitle}>Đội ngũ chuyên môn</h2>
            <div className={styles.teamGrid}>
              {/* Member 1 */}
              <div className={styles.teamCard}>
                <div className={styles.avatarWrapper}>
                  <img
                    src="/assets/learn-more/person1.png"
                    alt="Văn Hà Minh Quân"
                    className={styles.avatar}
                  />
                </div>
                <div className={styles.memberInfo}>
                  <h3 className={styles.memberName}>Văn Hà Minh Quân</h3>
                  <p className={styles.memberRole}>Fullstack Developer & System Design</p>
                  <div className={styles.memberQuote}>
                    "Mình chuyên về thiết kế hệ thống và phát triển fullstack, đảm bảo ứng dụng hoạt động ổn định và hiệu quả."
                  </div>
                  <div className={styles.skillsList}>
                    <h4>Kỹ năng nổi bật:</h4>
                    <ul>
                      <li>Thiết kế kiến trúc hệ thống</li>
                      <li>Phát triển Backend (Node.js, NestJS)</li>
                      <li>Phát triển Frontend (React, Next.js)</li>
                      <li>Quản lý cơ sở dữ liệu</li>
                      <li>Triển khai hệ thống (Docker, AWS)</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Member 2 */}
              <div className={styles.teamCard}>
                <div className={styles.avatarWrapper}>
                  <img
                    src="/assets/learn-more/person2.jpg"
                    alt="Ngô Tiến Tài"
                    className={styles.avatar}
                  />
                </div>
                <div className={styles.memberInfo}>
                  <h3 className={styles.memberName}>Ngô Tiến Tài</h3>
                  <p className={styles.memberRole}>Frontend Developer & UX/UI Designer</p>
                  <div className={styles.memberQuote}>
                    "Mình tập trung vào tạo ra trải nghiệm người dùng mượt mà với giao diện đẹp mắt và dễ sử dụng."
                  </div>
                  <div className={styles.skillsList}>
                    <h4>Kỹ năng nổi bật:</h4>
                    <ul>
                      <li>Thiết kế giao diện người dùng (Figma)</li>
                      <li>Phát triển Frontend (React, TypeScript)</li>
                      <li>Tối ưu hiệu suất website</li>
                      <li>Animation & Micro-interaction</li>
                      <li>Responsive Design</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Member 3 */}
              <div className={styles.teamCard}>
                <div className={styles.avatarWrapper}>
                  <img
                    src="/assets/learn-more/person3.jpg"
                    alt="Lê Quốc Vinh"
                    className={styles.avatar}
                  />
                </div>
                <div className={styles.memberInfo}>
                  <h3 className={styles.memberName}>Lê Quốc Vinh</h3>
                  <p className={styles.memberRole}>Security Specialist</p>
                  <div className={styles.memberQuote}>
                    "Mình đảm bảo mọi sản phẩm đều an toàn trước các mối đe dọa bảo mật, bảo vệ dữ liệu người dùng."
                  </div>
                  <div className={styles.skillsList}>
                    <h4>Kỹ năng nổi bật:</h4>
                    <ul>
                      <li>Bảo mật ứng dụng web</li>
                      <li>Kiểm thử thâm nhập</li>
                      <li>Mã hóa dữ liệu</li>
                      <li>Xác thực & Phân quyền</li>
                      <li>Phân tích lỗ hổng bảo mật</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Project Showcase */}
        <section className={styles.projectsSection}>
          <div className={styles.sectionContent}>
            <h2 className={styles.sectionTitle}>Dự án hiện tại: AutoCookies</h2>
            <div className={styles.projectShowcase}>
              <div className={styles.projectCard}>
                <div className={styles.projectImage}></div>
                <div className={styles.projectInfo}>
                  <h3>Mạng xã hội AutoCookies</h3>
                  <p>Nền tảng kết nối những người yêu thích ô tô với phong cách thiết kế tươi mới</p>

                  <div className={styles.projectFeatures}>
                    <h4>Tính năng chính:</h4>
                    <ul>
                      <li>Hệ thống đăng bài, bình luận và tương tác</li>
                      <li>Phân quyền người dùng đa cấp độ</li>
                      <li>Tích hợp công cụ quản lý nội dung</li>
                      <li>Bảo mật thông tin người dùng</li>
                      <li>Giao diện responsive trên mọi thiết bị</li>
                    </ul>
                  </div>

                  <div className={styles.projectTech}>
                    <h4>Công nghệ sử dụng:</h4>
                    <div className={styles.techTags}>
                      <span>Next.js</span>
                      <span>ExpressJS</span>
                      <span>MongoDB</span>
                      <span>Redis</span>
                      <span>Cloudinary</span>
                      <span>JWT</span>
                      <span>Tailwind CSS</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Working Style */}
        <section className={styles.workflowSection}>
          <div className={styles.sectionContent}>
            <h2 className={styles.sectionTitle}>Quy trình làm việc</h2>
            <div className={styles.workflowSteps}>
              <div className={styles.workStep}>
                <div className={styles.stepNumber}>1</div>
                <div className={styles.stepContent}>
                  <h3>Phân tích yêu cầu</h3>
                  <p>Thảo luận và xác định rõ mục tiêu dự án</p>
                </div>
              </div>
              <div className={styles.workStep}>
                <div className={styles.stepNumber}>2</div>
                <div className={styles.stepContent}>
                  <h3>Thiết kế giải pháp</h3>
                  <p>Lên kiến trúc hệ thống và thiết kế giao diện</p>
                </div>
              </div>
              <div className={styles.workStep}>
                <div className={styles.stepNumber}>3</div>
                <div className={styles.stepContent}>
                  <h3>Phát triển sản phẩm</h3>
                  <p>Triển khai code với quy trình rõ ràng</p>
                </div>
              </div>
              <div className={styles.workStep}>
                <div className={styles.stepNumber}>4</div>
                <div className={styles.stepContent}>
                  <h3>Kiểm thử & Bàn giao</h3>
                  <p>Đảm bảo chất lượng trước khi đưa vào sử dụng</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className={styles.ctaSection}>
          <div className={styles.ctaContent}>
            <h2 className={styles.ctaTitle}>Bạn muốn hợp tác cùng chúng tôi?</h2>
            <p className={styles.ctaText}>
              Hãy liên hệ để cùng tạo ra những sản phẩm công nghệ chất lượng
            </p>
            <div className={styles.ctaButtons}>
              <a
                href="mailto:vanhaminhquan2406@gmail.com"
                className={styles.ctaButtonPrimary}
              >
                Liên hệ qua email
              </a>
              <a
                href="#"
                className={styles.ctaButtonSecondary}
              >
                Xem portfolio đầy đủ
              </a>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default TeamPage;