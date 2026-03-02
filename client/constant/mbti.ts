export interface MBTIQuestion {
  id: number;
  text: string;
  dimension: "EI" | "SN" | "TF" | "JP";
  multiplier: 1 | -1; // 1 means "Agree" aligns with first letter (E, S, T, J), -1 aligns with second (I, N, F, P)
}

export const mbtiQuestions: MBTIQuestion[] = [
  // E vs I
  { id: 1, text: "Bạn cảm thấy tràn đầy năng lượng sau khi dành thời gian với một nhóm người.", dimension: "EI", multiplier: 1 },
  { id: 2, text: "Bạn thường thích nạp lại năng lượng bằng cách ở một mình.", dimension: "EI", multiplier: -1 },
  { id: 3, text: "Bạn thích là trung tâm của sự chú ý tại các sự kiện xã hội.", dimension: "EI", multiplier: 1 },
  { id: 4, text: "Bạn cảm thấy mệt mỏi nếu phải giao tiếp quá nhiều trong ngày.", dimension: "EI", multiplier: -1 },
  { id: 5, text: "Bạn dễ dàng bắt chuyện với người lạ.", dimension: "EI", multiplier: 1 },

  // S vs N
  { id: 6, text: "Bạn tập trung vào thực tế hiện tại hơn là những khả năng trong tương lai.", dimension: "SN", multiplier: 1 },
  { id: 7, text: "Bạn thích những ý tưởng trừu tượng và lý thuyết tổng quát.", dimension: "SN", multiplier: -1 },
  { id: 8, text: "Bạn chú trọng vào chi tiết cụ thể hơn là bức tranh toàn cảnh.", dimension: "SN", multiplier: 1 },
  { id: 9, text: "Bạn thường mơ mộng về những viễn cảnh tương lai.", dimension: "SN", multiplier: -1 },
  { id: 10, text: "Bạn tin vào kinh nghiệm thực tế hơn là bản năng.", dimension: "SN", multiplier: 1 },

  // T vs F
  { id: 11, text: "Bạn đưa ra quyết định dựa trên logic và sự thật khách quan.", dimension: "TF", multiplier: 1 },
  { id: 12, text: "Cảm xúc của người khác là yếu tố quan trọng khi bạn quyết định.", dimension: "TF", multiplier: -1 },
  { id: 13, text: "Bạn coi trọng sự công bằng hơn là sự hòa hợp.", dimension: "TF", multiplier: 1 },
  { id: 14, text: "Bạn thường hành động theo những gì trái tim mách bảo.", dimension: "TF", multiplier: -1 },
  { id: 15, text: "Bạn là người thực tế và đôi khi bị coi là khô khan.", dimension: "TF", multiplier: 1 },

  // J vs P
  { id: 16, text: "Bạn thích có một lịch trình cụ thể và tuân thủ nó.", dimension: "JP", multiplier: 1 },
  { id: 17, text: "Bạn thích để các lựa chọn mở và hành động ngẫu hứng.", dimension: "JP", multiplier: -1 },
  { id: 18, text: "Bạn cảm thấy khó chịu nếu công việc chưa được hoàn thành dứt điểm.", dimension: "JP", multiplier: 1 },
  { id: 19, text: "Bạn làm việc hiệu quả nhất dưới áp lực sát nút (deadline).", dimension: "JP", multiplier: -1 },
  { id: 20, text: "Bạn thích lập kế hoạch cho các chuyến đi một cách chi tiết.", dimension: "JP", multiplier: 1 },
];

export interface MBTITypeInfo {
  type: string;
  name: string;
  title: string;
  description: string;
  strengths: string[];
  careerAdvice: string;
  suitableRoles: string[];
  backgroundColor: string;
}

export const mbtiTypes: Record<string, MBTITypeInfo> = {
  "INTJ": {
    type: "INTJ",
    name: "Kiến trúc sư",
    title: "Nhà tư duy chiến lược và quyết đoán",
    description: "Bạn là người có tư duy logic cao, độc lập và luôn tìm kiếm sự hoàn hảo. Bạn nhìn thấy những khả năng mà người khác thường bỏ qua.",
    strengths: ["Tư duy chiến lược", "Độc lập", "Quyết tâm", "Sáng tạo"],
    careerAdvice: "Bạn phù hợp với những dự án freelancer yêu cầu xử lý vấn đề phức tạp và tầm nhìn dài hạn.",
    suitableRoles: ["Software Architect", "Data Scientist", "Business Analyst", "Strategy Consultant"],
    backgroundColor: "from-indigo-600 to-purple-600"
  },
  "INTP": {
    type: "INTP",
    name: "Nhà logic học",
    title: "Người giải quyết vấn đề bằng trí tuệ",
    description: "Bạn thích khám phá các lý thuyết và tìm hiểu cách mọi thứ vận hành. Bạn không ngừng tìm kiếm kiến thức mới.",
    strengths: ["Phân tích khách quan", "Cởi mở", "Nhiệt huyết", "Trí tưởng tượng"],
    careerAdvice: "Hãy tập trung vào các công việc nghiên cứu hoặc phát triển sản phẩm sáng tạo.",
    suitableRoles: ["Backend Developer", "Systems Analyst", "Technical Writer", "Researcher"],
    backgroundColor: "from-purple-500 to-pink-500"
  },
  "ENTJ": {
    type: "ENTJ",
    name: "Nhà điều hành",
    title: "Lãnh đạo quyết đoán và mạnh mẽ",
    description: "Bạn là người có tố chất lãnh đạo tự nhiên, luôn tập trung vào mục tiêu và hiệu quả công việc.",
    strengths: ["Hiệu quả", "Tự tin", "Quyết đoán", "Năng lượng dồi dào"],
    careerAdvice: "Bạn nên đảm nhận các vị trí quản lý dự án lớn hoặc tư vấn tăng trưởng doanh nghiệp.",
    suitableRoles: ["Project Manager", "Operations Manager", "Sales Director", "Startup Founder"],
    backgroundColor: "from-blue-600 to-indigo-700"
  },
  "ENTP": {
    type: "ENTP",
    name: "Người tranh biện",
    title: "Nhà đổi mới và yêu thích thách thức",
    description: "Bạn nhanh trí, năng động và luôn sẵn sàng thử thách những quan niệm cũ kỹ để tìm ra giải pháp mới.",
    strengths: ["Thông minh", "Linh hoạt", "Giao tiếp tốt", "Khả năng thích nghi"],
    careerAdvice: "Các công việc yêu cầu sự sáng tạo và đổi mới liên tục sẽ giúp bạn phát huy tối đa khả năng.",
    suitableRoles: ["Product Designer", "Marketing Strategist", "Copywriter", "Venture Capitalist"],
    backgroundColor: "from-orange-500 to-red-600"
  },
  "INFJ": {
    type: "INFJ",
    name: "Người bảo vệ",
    title: "Nhà lý tưởng hóa có chiều sâu",
    description: "Bạn là người giàu lòng trắc ẩn, thầm lặng nhưng có sức ảnh hưởng mạnh mẽ với những người xung quanh.",
    strengths: ["Sáng tạo", "Sâu sắc", "Tận tâm", "Truyền cảm hứng"],
    careerAdvice: "Các lĩnh vực liên quan đến tâm lý, giáo dục hoặc phát triển con người là nơi bạn tỏa sáng.",
    suitableRoles: ["Counselor", "Education Consultant", "Content Creator", "NGO Director"],
    backgroundColor: "from-teal-500 to-emerald-600"
  },
  "INFP": {
    type: "INFP",
    name: "Người hòa giải",
    title: "Nhà thơ giàu trí tưởng tượng",
    description: "Bạn luôn tìm kiếm ý nghĩa trong mọi việc và mong muốn thế giới trở nên tốt đẹp hơn.",
    strengths: ["Lòng trắc ẩn", "Sáng tạo", "Tự do", "Đồng cảm"],
    careerAdvice: "Hãy theo đuổi các công việc tự do cho phép bạn bộc lộ bản sắc cá nhân và giá trị cốt lõi.",
    suitableRoles: ["Writer", "Graphic Designer", "Artist", "Mental Health Coach"],
    backgroundColor: "from-green-500 to-teal-500"
  },
  "ENFJ": {
    type: "ENFJ",
    name: "Người chỉ dạy",
    title: "Lãnh đạo lôi cuốn và đồng cảm",
    description: "Bạn giỏi kết nối mọi người và luôn nỗ lực vì sự phát triển của cộng đồng.",
    strengths: ["Lôi cuốn", "Đáng tin cậy", "Sự đồng cảm", "Giao tiếp tuyệt vời"],
    careerAdvice: "Vai trò quản lý cộng đồng hoặc đào tạo trực tuyến rất phù hợp với bạn.",
    suitableRoles: ["Community Manager", "Corporate Trainer", "HR Consultant", "Life Coach"],
    backgroundColor: "from-rose-500 to-orange-500"
  },
  "ENFP": {
    type: "ENFP",
    name: "Người truyền cảm hứng",
    title: "Tâm hồn tự do và đầy nhiệt huyết",
    description: "Bạn tràn đầy năng lượng, sáng tạo và luôn tìm thấy lý do để mỉm cười trong mọi tình huống.",
    strengths: ["Nhiệt huyết", "Sáng tạo", "Dễ gần", "Lạc quan"],
    careerAdvice: "Công việc freelancer mang lại cho bạn sự đa dạng và tự do mà bạn luôn khao khát.",
    suitableRoles: ["Social Media Manager", "Event Planner", "Public Relations", "YouTuber"],
    backgroundColor: "from-yellow-400 to-orange-500"
  },
  "ISTJ": {
    type: "ISTJ",
    name: "Người trách nhiệm",
    title: "Nhân viên thực tế và tận tâm",
    description: "Bạn là người thực tế, coi trọng sự thật và luôn hoàn thành nhiệm vụ một cách chính xác nhất.",
    strengths: ["Trung thực", "Trách nhiệm", "Bình tĩnh", "Kỷ luật"],
    careerAdvice: "Các công việc yêu cầu sự chính xác cao và quy trình rõ ràng là thế mạnh của bạn.",
    suitableRoles: ["Accountant", "Internal Auditor", "Quality Control", "Compliance Officer"],
    backgroundColor: "from-slate-600 to-slate-800"
  },
  "ISFJ": {
    type: "ISFJ",
    name: "Người nuôi dưỡng",
    title: "Người bảo vệ thầm lặng và tận tụy",
    description: "Bạn luôn sẵn sàng hỗ trợ người khác và có tinh thần trách nhiệm cực kỳ cao đối với công việc.",
    strengths: ["Hỗ trợ", "Tận tụy", "Tỉ mỉ", "Đáng tin cậy"],
    careerAdvice: "Bạn sẽ thành công trong các vai trò hỗ trợ khách hàng hoặc quản trị văn phòng.",
    suitableRoles: ["Customer Success", "Administrative Assistant", "Medical Freelancer", "Translator"],
    backgroundColor: "from-blue-400 to-indigo-500"
  },
  "ESTJ": {
    type: "ESTJ",
    name: "Người giám sát",
    title: "Nhà quản lý thực tế và truyền thống",
    description: "Bạn giỏi tổ chức công việc và con người, luôn hướng tới kết quả một cách có hệ thống.",
    strengths: ["Tổ chức", "Rõ ràng", "Tận tâm", "Thực tế"],
    careerAdvice: "Hãy đảm nhận các dự án yêu cầu sự quản lý chặt chẽ và tuân thủ quy trình.",
    suitableRoles: ["Operations Consultant", "Project Coordinator", "Real Estate Broker", "School Principal"],
    backgroundColor: "from-blue-700 to-cyan-800"
  },
  "ESFJ": {
    type: "ESFJ",
    name: "Người quan tâm",
    title: "Người giúp đỡ nhiệt tình và thực tế",
    description: "Bạn là người hòa đồng, luôn quan tâm đến cảm xúc của người khác và mong muốn xây dựng mối quan hệ tốt đẹp.",
    strengths: ["Hòa đồng", "Trung thành", "Tận tâm", "Kỹ năng thực hành tốt"],
    careerAdvice: "Vai trò cố vấn hoặc dịch vụ khách hàng cao cấp sẽ giúp bạn phát huy tối đa sự tận tâm.",
    suitableRoles: ["HR Specialist", "Travel Consultant", "Insurance Agent", "Hospitality Manager"],
    backgroundColor: "from-pink-400 to-rose-500"
  },
  "ISTP": {
    type: "ISTP",
    name: "Nhà kỹ thuật",
    title: "Người thực hành linh hoạt và khéo léo",
    description: "Bạn thích khám phá mọi thứ bằng chính đôi tay và trí tuệ của mình, giải quyết vấn đề bằng hành động.",
    strengths: ["Linh hoạt", "Thực tế", "Tự tin trong khủng hoảng", "Thích nghi nhanh"],
    careerAdvice: "Bạn phù hợp với các công việc kỹ thuật thực tế hoặc phân tích hệ thống.",
    suitableRoles: ["Software Developer", "Technical Specialist", "Forensic Expert", "Mechanic"],
    backgroundColor: "from-gray-600 to-zinc-700"
  },
  "ISFP": {
    type: "ISFP",
    name: "Người nghệ sĩ",
    title: "Nhà thám hiểm có tâm hồn nhạy cảm",
    description: "Bạn sống trong hiện tại, có gu thẩm mỹ cao và luôn mong muốn thử nghiệm những điều mới mẻ.",
    strengths: ["Nhạy cảm", "Sáng tạo", "Đam mê", "Yêu thích tự do"],
    careerAdvice: "Các công việc sáng tạo tự do cho phép bạn bộc lộ khả năng cảm thụ nghệ thuật.",
    suitableRoles: ["Fashion Designer", "Photographer", "UI/UX Designer", "Musician"],
    backgroundColor: "from-emerald-400 to-teal-500"
  },
  "ESTP": {
    type: "ESTP",
    name: "Người thực thi",
    title: "Nhà thám hiểm năng động và mạo hiểm",
    description: "Bạn thích hành động, nhạy bén với các cơ hội và luôn sẵn sàng dấn thân vào những thử thách mới.",
    strengths: ["Bạo dạn", "Thực tế", "Quan sát tốt", "Kỹ năng xã hội"],
    careerAdvice: "Công việc freelancer trong mảng bán hàng hoặc dự án ngắn hạn đầy thử thách rất hợp với bạn.",
    suitableRoles: ["Business Developer", "Sales Freelancer", "Sports Coach", "Entrepreneur"],
    backgroundColor: "from-red-500 to-yellow-600"
  },
  "ESFP": {
    type: "ESFP",
    name: "Người trình diễn",
    title: "Tâm hồn của mọi bữa tiệc",
    description: "Bạn là người tràn đầy năng lượng, thích sự náo nhiệt và luôn biết cách làm cho mọi người vui vẻ.",
    strengths: ["Bạo dạn", "Giao tiếp tốt", "Gu thẩm mỹ", "Nhiệt tình"],
    careerAdvice: "Các công việc mảng giải trí, sự kiện hoặc truyền thông sẽ giúp bạn tỏa sáng.",
    suitableRoles: ["Event Host", "Public Speaker", "Actor", "Beauty Influencer"],
    backgroundColor: "from-cyan-400 to-blue-500"
  },
};
