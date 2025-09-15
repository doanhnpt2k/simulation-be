-- Sample MBTI Questions
-- E vs I questions (Extraversion vs Introversion)
INSERT INTO mbti_questions (id, content, category, "order", "isActive", created_at, updated_at) VALUES
(gen_random_uuid(), 'Bạn thích dành thời gian với nhiều người hơn là một mình', 'E_I', 1, true, NOW(), NOW()),
(gen_random_uuid(), 'Bạn cảm thấy năng lượng khi ở trong đám đông', 'E_I', 2, true, NOW(), NOW()),
(gen_random_uuid(), 'Bạn thích suy ngẫm và suy nghĩ sâu sắc về các vấn đề', 'E_I', 3, true, NOW(), NOW()),
(gen_random_uuid(), 'Bạn thích làm việc một mình hơn là trong nhóm', 'E_I', 4, true, NOW(), NOW()),
(gen_random_uuid(), 'Bạn thích giao tiếp và tương tác với người khác', 'E_I', 5, true, NOW(), NOW()),

-- S vs N questions (Sensing vs Intuition)
(gen_random_uuid(), 'Bạn thích tập trung vào chi tiết cụ thể hơn là ý tưởng tổng quát', 'S_N', 6, true, NOW(), NOW()),
(gen_random_uuid(), 'Bạn thích dữ liệu thực tế hơn là khả năng sáng tạo', 'S_N', 7, true, NOW(), NOW()),
(gen_random_uuid(), 'Bạn thích suy nghĩ về các khả năng và ý tưởng mới', 'S_N', 8, true, NOW(), NOW()),
(gen_random_uuid(), 'Bạn thích tập trung vào bức tranh lớn hơn là chi tiết', 'S_N', 9, true, NOW(), NOW()),
(gen_random_uuid(), 'Bạn thích làm việc với thông tin cụ thể và thực tế', 'S_N', 10, true, NOW(), NOW()),

-- T vs F questions (Thinking vs Feeling)
(gen_random_uuid(), 'Bạn ra quyết định dựa trên logic và phân tích khách quan', 'T_F', 11, true, NOW(), NOW()),
(gen_random_uuid(), 'Bạn ưu tiên sự công bằng hơn là sự hài hòa', 'T_F', 12, true, NOW(), NOW()),
(gen_random_uuid(), 'Bạn ra quyết định dựa trên cảm xúc và giá trị cá nhân', 'T_F', 13, true, NOW(), NOW()),
(gen_random_uuid(), 'Bạn quan tâm đến cảm xúc của người khác khi ra quyết định', 'T_F', 14, true, NOW(), NOW()),
(gen_random_uuid(), 'Bạn thích phân tích vấn đề một cách logic và khách quan', 'T_F', 15, true, NOW(), NOW()),

-- J vs P questions (Judging vs Perceiving)
(gen_random_uuid(), 'Bạn thích lập kế hoạch và có cấu trúc rõ ràng', 'J_P', 16, true, NOW(), NOW()),
(gen_random_uuid(), 'Bạn thích sự chắc chắn và quyết định nhanh chóng', 'J_P', 17, true, NOW(), NOW()),
(gen_random_uuid(), 'Bạn thích sự linh hoạt và tự do trong công việc', 'J_P', 18, true, NOW(), NOW()),
(gen_random_uuid(), 'Bạn thích thích ứng theo tình huống hơn là lập kế hoạch', 'J_P', 19, true, NOW(), NOW()),
(gen_random_uuid(), 'Bạn thích hoàn thành công việc trước khi bắt đầu việc mới', 'J_P', 20, true, NOW(), NOW());
