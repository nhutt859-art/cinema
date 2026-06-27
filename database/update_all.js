const { Client } = require('pg');

const DB_CONFIG = {
  host: 'localhost', port: 5432,
  database: 'cinema_db', user: 'postgres',
  password: '20040608Tm.n',
};

const TVMAZE_TO_SLUG = {
  'Action': 'hanh-dong', 'Adventure': 'hanh-dong', 'Comedy': 'hai-huoc',
  'Romance': 'tinh-cam', 'Horror': 'kinh-di', 'Science-Fiction': 'khoa-hoc-vien-tuong',
  'Fantasy': 'khoa-hoc-vien-tuong', 'Animation': 'hoat-hinh', 'Anime': 'hoat-hinh',
  'Music': 'hoat-hinh', 'Musical': 'hoat-hinh', 'Children': 'hoat-hinh', 'Family': 'hoat-hinh',
};

// =========== MÔ TẢ TIẾNG VIỆT CÓ DẤU + TRAILER ===========

const movieData = {
  'Westworld': {
    desc: 'Westworld là một câu chuyện u tối về sự khai minh của ý thức nhân tạo và sự tiến hóa của tội lỗi. Lấy bối cảnh tại điểm giao thoa giữa tương lai gần và quá khứ tái hiện, bộ phim khám phá một thế giới nơi mọi ham muốn của con người, dù cao quý hay đồi trụy, đều có thể được thỏa mãn.',
    trailer: 'https://www.youtube.com/watch?v=9BqKiZhEFFw'
  },
  'Friday Night Lights': {
    desc: 'Tại thị trấn Dillon, Texas, bóng đá là cả một tôn giáo. Huấn luyện viên trưởng Eric Taylor phải chịu áp lực lớn khi dẫn dắt đội bóng Dillon Panthers bước vào mùa giải mới giữa những kỳ vọng vô cùng lớn về chức vô địch.',
    trailer: 'https://www.youtube.com/watch?v=9XYRZ4C2JGs'
  },
  'Death in Paradise': {
    desc: 'Những vụ án mạng và rượu mojito. Một thanh tra người Anh vừa đặt chân lên hòn đảo Caribe xinh đẹp Saint Marie để gia nhập lực lượng cảnh sát nơi đây và phá giải những vụ án bí ẩn chết người.',
    trailer: 'https://www.youtube.com/watch?v=OXTwvDAMpiw'
  },
  'Freaks and Geeks': {
    desc: 'Bộ phim từng đoạt giải Emmy kể về những thử thách và niềm vui của những học sinh trung học bị cô lập ở Michigan những năm 1980, với những câu chuyện tuổi mới lớn đầy cảm động và hài hước.',
    trailer: 'https://www.youtube.com/watch?v=XMCZQq25_t4'
  },
  'Private Practice': {
    desc: 'Câu chuyện về một nhóm bác sĩ tài giỏi cùng nhau làm việc để thay đổi cuộc sống bệnh nhân tốt đẹp hơn. Các bác sĩ của Seaside Health and Wellness xử lý những ca bệnh khó khăn nhất, nơi những vấn đề y tế thường đặt ra các tình huống nan giải về đạo đức.',
    trailer: 'https://www.youtube.com/watch?v=GmMJOAEAjVA'
  },
  'Strike Back': {
    desc: 'Strike Back là loạt phim hành động quân sự Anh-Mỹ, theo chân các hoạt động của Tiểu đội 20, một nhánh bí mật của Cơ quan Tình báo Quốc phòng Anh, thực hiện những nhiệm vụ nguy hiểm trên toàn cầu với nhịp độ nghẹt thở.',
    trailer: 'https://www.youtube.com/watch?v=7M6VpPqHgxE'
  },
  'Being Human': {
    desc: 'Bộ phim hài chính kịch về ba người bạn cùng phòng đang cố gắng sống cuộc sống bình thường, mặc dù phải vật lộn với những tật ước kỳ lạ: một người là người sói, một người là ma cà rồng và một người là ma.',
    trailer: 'https://www.youtube.com/watch?v=px2DN3OuMgI'
  },
  'Beverly Hills, 90210': {
    desc: 'Loạt phim chính kịch dài hơi kể về trải nghiệm của một nhóm bạn trẻ ở Beverly Hills, California, khi họ trải qua thời trung học, đại học và cuối cùng là thế giới thực sự, đối mặt với những mối tình, bi kịch gia đình và những cơn nghiện.',
    trailer: 'https://www.youtube.com/watch?v=zPgq2D6l6UU'
  },
  'Knight Rider': {
    desc: 'Michael Knight, một thám tử tưởng chừng đã chết, được tạo một khuôn mặt và danh tính mới. Nhiệm vụ của anh: chiến đấu chống tội phạm với sự giúp đỡ của chiếc xe hơi thông minh K.I.T.T., một vũ khí tốc độ cao được trang bị công nghệ tương lai.',
    trailer: 'https://www.youtube.com/watch?v=HIyaGQ5d1yo'
  },
  'Dawson\'s Creek': {
    desc: 'Dawson Leery, Joey Potter và Pacey Witter là những người bạn thân từ nhỏ. Cuộc sống của họ bắt đầu thay đổi nhanh chóng khi cô gái mới Jen Lindley chuyển đến ở bên cạnh và cả bốn bước vào trường trung học với biết bao biến cố tuổi trẻ.',
    trailer: 'https://www.youtube.com/watch?v=OYXyGXfYqhg'
  },
  'Pushing Daisies': {
    desc: 'Một người làm bánh có khả năng đặc biệt có thể chạm vào người chết để họ sống lại. Khi tái sử dụng năng lực này, anh vô tình làm thay đổi cuộc sống của những người xung quanh theo những cách không ngờ.',
    trailer: 'https://www.youtube.com/watch?v=O2JdU7WqHYA'
  },
  'Magnum P.I.': {
    desc: 'Thomas Magnum, một cựu quân nhân Navy, làm việc như một điều viên tư nhân tại Hawaii. Anh sống trên khu bất động sản sang trọng của một tác giả giàu có và giải quyết những vụ án hình sự bằng phong cách riêng đầy lôi cuốn.',
    trailer: 'https://www.youtube.com/watch?v=lxnFl3wpKEI'
  },
  'Hawaii Five-O': {
    desc: 'Một đội đặc nhiệm tinh nhuệ của Hawaii chiến đấu chống lại tội phạm và bảo vệ công lý trên quần đảo. Được dẫn dắt bởi Steve McGarrett, họ xử lý những vụ án nghiêm trọng nhất mà cảnh sát địa phương không thể giải quyết.',
    trailer: 'https://www.youtube.com/watch?v=3vlb7sFIgqY'
  },
  'Camelot': {
    desc: 'Câu chuyện huyền thoại về Vương quốc Camelot, nơi Vua Arthur và các hiệp sĩ Bàn Tròn cùng nhau xây dựng một vương quốc công bằng và hòa bình giữa những thế lực ham muốn quyền lực và bóng tối.',
    trailer: 'https://www.youtube.com/watch?v=I2KZql1z_Gw'
  },
  'Tru Calling': {
    desc: 'Tru Davies, một sinh viên y khoa, nhận được một công việc tại nhà xác. Cô phát hiện ra mình có khả năng đặc biệt: có thể quay ngược thời gian để cứu sống người chết sau khi nghe những lời cầu xin giúp đỡ từ các thi thể vô tri.',
    trailer: 'https://www.youtube.com/watch?v=4IVjAqVfVFs'
  },
  'V': {
    desc: 'Những người ngoài hành tinh mang hình dạng con người đến Trái Đất trong hòa bình, nhưng đằng sau đó là một âm mưu xâm lược nguy hiểm. Một nhóm người kháng chiến phải chiến đấu để bại lộ sự thật và bảo vệ nhân loại.',
    trailer: 'https://www.youtube.com/watch?v=F6T8cA0DYkM'
  },
  'Baywatch': {
    desc: 'Loạt phim kinh điển về đội cứu hộ bờ biển ở bãi biển Los Angeles County. Những người cứu hộ không chỉ chiến đấu với sóng to gió lớn mà còn đối mặt với tội phạm và những tình huống nguy hiểm khác.',
    trailer: 'https://www.youtube.com/watch?v=1b1MOnBcyoQ'
  },
  'Agatha Christie\'s Poirot': {
    desc: 'Thám tử tài ba Hercule Poirot với bộ ria đẹp nhất nước Anh giải quyết những vụ án hình sự phức tạp nhất. Được chuyển thể từ tiểu thuyết kinh điển của Agatha Christie, đầy lôi cuốn và bất ngờ.',
    trailer: 'https://www.youtube.com/watch?v=DKF9VLO_k0I'
  },
  'Good Witch': {
    desc: 'Cassie Nightingale, một người phụ nữ bí ẩn với sức mạnh tâm linh đặc biệt, mở một cửa hàng phép thuật tại thị trấn Middletown. Cô sử dụng tài năng của mình để giúp đỡ mọi người và mang lại niềm vui cho cộng đồng.',
    trailer: 'https://www.youtube.com/watch?v=krNNXnTzjvM'
  },
  'Low Winter Sun': {
    desc: 'Một câu chuyện tội phạm đầy căng thẳng lấy bối cảnh thành phố Detroit. Khi một vụ sát hại xảy ra trong lúc tự vệ, một thanh tra và một tên tội phạm bị cuốn vào một vòng xoáy bạo thủ và phản bội đầy nghiệt ngã.',
    trailer: 'https://www.youtube.com/watch?v=SQh5Z9LOKYs'
  },
  'Humans': {
    desc: 'Trong một thế giới song song nơi robot thông minh mang tên Synth phục vụ con người trong mọi gia đình, một gia đình mua một Synth và khám phá ra những bí mật đen tối về ý thức nhân tạo và cuộc nổi dậy của robot.',
    trailer: 'https://www.youtube.com/watch?v=IRw_kFV0uYs'
  }
};

// =========== DANH SÁCH 30 PHIM MỚI ===========
const newMovieData = [
  { title: 'The Expanse', desc: 'Hai thế kỷ trong tương lai, con người đã thuộc địa hóa Hệ Mặt Trời. Một thám tử gốc Sao Hỏa và một thuyền trưởng tàu không gian bị cuốn vào một âm mưu nguy hiểm đe dọa sự sống của toàn nhân loại.', trailer: 'https://www.youtube.com/watch?v=yWqlB5m8CaA' },
  { title: 'Mr. Robot', desc: 'Elliot Alderson, một kỹ sư an ninh mạng tài năng nhưng mắc chứng rối loạn lo âu, được một nhóm hacktivist bí ẩn tuyển dụng để phá hủy một tập đoàn tài chính khổng lồ.', trailer: 'https://www.youtube.com/watch?v=Ug4fRXGyIak' },
  { title: 'The Walking Dead', desc: 'Trong một thế giới hậu tận thế bị xâm chiếm bởi xác sống, một nhóm người sống sót phải chiến đấu để tồn tại không chỉ chống lại thây ma mà còn chống lại những mối đe dọa từ chính con người.', trailer: 'https://www.youtube.com/watch?v=sfAc2U20uyg' },
  { title: 'Black Mirror', desc: 'Loạt phim tuyển tập khoa học viễn tưởng đen tối khám phá những hệ quả không lường trước của công nghệ hiện đại đối với xã hội và tâm lý con người trong từng tập phim độc lập.', trailer: 'https://www.youtube.com/watch?v=V0XOApF7ZP4' },
  { title: 'House of Cards', desc: 'Chính trường Washington DC đầy mưu mô và thủ đoạn qua câu chuyện về Francis Underwood, một chính khách đầy tham vọng không ngừng leo lên nấc thang quyền lực bằng mọi giá.', trailer: 'https://www.youtube.com/watch?v=ULwUzF1q5w4' },
  { title: 'Dexter', desc: 'Dexter Morgan, một nhà phân tích máu cho cảnh sát Miami, ban ngày là đồng nghiệp đáng tin cậy nhưng ban đêm là một kẻ giết người hàng loạt chỉ nhắm vào những tên tội phạm đã thoát khỏi công lý.', trailer: 'https://www.youtube.com/watch?v=YQeUmSD1c3g' },
  { title: 'Better Call Saul', desc: 'Tiền truyện của Breaking Bad kể về cuộc đời của Jimmy McGill, một luật sư nhỏ bé đầy tham vọng nhưng luôn gặp bất hạnh, dần dần biến thành luật sư tội phạm Saul Goodman.', trailer: 'https://www.youtube.com/watch?v=HN4cc1Z7OpA' },
  { title: 'Orange Is the New Black', desc: 'Dựa trên câu chuyện có thật, bộ phim kể về cuộc sống trong nhà tù nữ giới Liên bang qua góc nhìn của Piper Chapman, một phụ nữ thuộc tầng lớp thượng lưu bị kết án vì tội vận chuyển ma túy.', trailer: 'https://www.youtube.com/watch?v=8R4OZg5s3K0' },
  { title: 'The Office', desc: 'Bộ phim hài tình huống kinh điển về cuộc sống văn phòng tại Công ty Giấy Dunder Mifflin, nơi quản lý Michael Scott luôn gây ra những tình huống dở khóc dở cười cho các nhân viên.', trailer: 'https://www.youtube.com/watch?v=QZxP_bmZRCA' },
  { title: 'Parks and Recreation', desc: 'Bộ phim hài tài liệu giả về Sở Công viên và Giải trí của thị trấn nhỏ Pawnee, Indiana, nơi người quản lý nhiệt huyết Leslie Knope chiến đấu để làm cho thị trấn của mình tốt đẹp hơn.', trailer: 'https://www.youtube.com/watch?v=pMvSjjEH-Q8' },
  { title: 'Brooklyn Nine-Nine', desc: 'Đồn cảnh sát số 99 ở Brooklyn là nơi làm việc của một nhóm thám tử tài năng nhưng lập dị dưới sự chỉ huy của Đại úy Raymond Holt. Họ phá án và gây ra vô số tình huống hài hước.', trailer: 'https://www.youtube.com/watch?v=faT4YPeMUe4' },
  { title: 'Mindhunter', desc: 'Cuối những năm 1970, hai đặc vụ FBI bắt đầu phỏng vấn những kẻ giết người hàng loạt bị giam giữ để hiểu tâm lý tội phạm, khai sinh ra ngành lược đồ hành vi tội phạm hiện đại.', trailer: 'https://www.youtube.com/watch?v=1-8lU4LP-X0' },
  { title: 'Vikings', desc: 'Câu chuyện sử thi về Ragnar Lothbrock, một nông dân người Bắc Âu trở thành vua Viking huyền thoại, dẫn dắt người dân của mình thực hiện những cuộc đột kích và khám phá vùng đất mới.', trailer: 'https://www.youtube.com/watch?v=cs9eB9nlm2s' },
  { title: 'Peaky Blinders', desc: 'Nước Anh năm 1919, gia đình Shelby điều hành băng đảng Peaky Blinders khét tiếng ở Birmingham. Thomas Shelby, thủ lĩnh đầy mưu lược, phải đối mặt với cảnh sát và các băng đảng đối thủ.', trailer: 'https://www.youtube.com/watch?v=oVzVdvGIC7U' },
  { title: 'Fargo', desc: 'Anthology tội phạm đen tối lấy cảm hứng từ bộ phim của anh em nhà Coen. Mỗi mùa phim là một câu chuyện mới với nhân vật mới, đầy những tình huống giết chóc bất ngờ và hài hước đen.', trailer: 'https://www.youtube.com/watch?v=PaPj3Tj7L1s' },
  { title: 'Outlander', desc: 'Claire Randall, một y tá từ năm 1945, bị xuyên không về năm 1743 ở Scotland. Cô buộc phải kết hôn với Jamie Fraser, một chiến binh Scotland dũng mãnh, và bị giằng xé giữa hai người đàn ông ở hai thời đại.', trailer: 'https://www.youtube.com/watch?v=c7qD3g5v8mI' },
  { title: 'Narcos', desc: 'Câu chuyện có thật về Pablo Escobar, trùm ma túy khét tiếng nhất lịch sử Colombia, và cuộc chiến săn lùng không khoan nhượng của các đặc vụ DEA Hoa Kỳ.', trailer: 'https://www.youtube.com/watch?v=9Ux6NuKw1bo' },
  { title: 'The Crown', desc: 'Bộ phim chính kịch lịch sử kể về triều đại của Nữ hoàng Elizabeth II từ những ngày đầu trị vì, khám phá những câu chuyện cá nhân và chính trị đằng sau ngai vàng nước Anh.', trailer: 'https://www.youtube.com/watch?v=WgEow0v4G4E' },
  { title: 'Stranger Things', desc: 'Năm 1983 tại thị trấn Hawkins, Indiana, một cậu bé mất tích và một cô gái bí ẩn với năng lực siêu nhiên xuất hiện, mở ra cánh cửa đến một thế giới đen tối song song.', trailer: 'https://www.youtube.com/watch?v=mVsJ4o3A2Vc' },
  { title: 'The Handmaid\'s Tale', desc: 'Trong một tương lai toàn trị, thế giới bị tàn phá bởi tỷ lệ sinh sản giảm. Phụ nữ màu mỡ bị bắt làm nô lệ sinh sản cho tầng lớp thống trị. Một người đầy tớ tên Offred chiến đấu để sống sót và đoàn tụ với gia đình.', trailer: 'https://www.youtube.com/watch?v=PJTonA2G_K4' },
  { title: 'The Witcher', desc: 'Geralt xứ Rivia, một thợ săn quái vật đột biến, lang thang khắp thế giới trong một hành trình định mệnh nơi những sinh vật huyền bí và ma thuật tồn tại, và số phận của anh gắn liền với một nàng phù thủy trẻ.', trailer: 'https://www.youtube.com/watch?v=tj0XL3Q5IdI' },
  { title: 'The Mandalorian', desc: 'Sau sự sụp đổ của Đế chế, một thợ săn tiền thương đơn độc lang thang khắp các vùng không gian xa xôi của thiên hà, bảo vệ một sinh vật bí ẩn mà mọi thế lực đều săn lùng.', trailer: 'https://www.youtube.com/watch?v=aOC8E8z_ifw' },
  { title: 'Chernobyl', desc: 'Bộ phim chính kịch kinh hoàng về thảm họa hạt nhân Chernobyl năm 1986 và những hy sinh anh dũng của những người đã ngã xuống để cứu châu Âu khỏi thảm kịch không thể tưởng tượng nổi.', trailer: 'https://www.youtube.com/watch?v=s9APLXM9Ei8' },
  { title: 'The Boys', desc: 'Trong một thế giới nơi siêu anh hùng được tôn sùng như thần thánh, một nhóm dân thường quyết định chiến đấu chống lại các siêu anh hùng tham nhũng, lạm dụng sức mạnh của mình mà không bị trừng phạt.', trailer: 'https://www.youtube.com/watch?v=M1bhOaLV4FU' },
  { title: 'Succession', desc: 'Gia đình Roy sở hữu một đế chế truyền thông toàn cầu. Khi người cha già yếu bắt đầu thoái vị, bốn người con bắt đầu cuộc chiến tranh giành quyền thừa kế đầy mưu mô và phản bội.', trailer: 'https://www.youtube.com/watch?v=nB_l8h9spVw' },
  { title: 'The Last of Us', desc: 'Hai mươi năm sau khi đại dịch nấm Cordyceps tàn phá thế giới, Joel, một người sống sót chai sạn, được giao nhiệm vụ đưa Ellie, một cô bé tuổi teen miễn nhiễm, băng qua nước Mỹ hoang tàn.', trailer: 'https://www.youtube.com/watch?v=l1sj5dpmuWw' },
  { title: 'Squid Game', desc: 'Hàng trăm người chơi mắc nợ được mời tham gia một trò chơi trẻ em bí ẩn với giải thưởng khổng lồ, nhưng họ nhanh chóng nhận ra rằng thua cuộc đồng nghĩa với cái chết trong cuộc chiến sinh tồn khốc liệt này.', trailer: 'https://www.youtube.com/watch?v=oqxAJKy0ii4' },
  { title: 'Money Heist', desc: 'Một nhóm cướp do "Giáo sư" chỉ huy thực hiện vụ cướp nhà in tiền của Tây Ban Nha. Với mặt nạ Dalì và bộ jumpsuit đỏ, họ đối đầu với cảnh sát trong một cuộc chiến căng thẳng kéo dài nhiều ngày.', trailer: 'https://www.youtube.com/watch?v=htqXL94Rza4' },
  { title: 'Dark', desc: 'Khi hai đứa trẻ mất tích trong thị trấn nhỏ Winden của Đức, bí mật gia đình và mối liên kết với quá khứ, hiện tại và tương lai dần được hé lộ trong một vòng lặp thời gian đen tối.', trailer: 'https://www.youtube.com/watch?v=cq2iTHoLrt0' },
  { title: 'Sons of Anarchy', desc: 'Một băng nhóm mô tô bất hợp pháp ở thị trấn nhỏ Charming, California, hoạt động như một đế chế tội phạm nhưng tự coi mình là những người bảo vệ cộng đồng trong một thế giới đầy bạo lực.', trailer: 'https://www.youtube.com/watch?v=XNDBHw4NYSU' },
];

async function main() {
  const c = new Client(DB_CONFIG);
  await c.connect();
  console.error('Connected to PostgreSQL');

  // =========== BƯỚC 1: Cập nhật mô tả + trailer cho 20 phim hiện tại ===========
  console.error('\n=== Bước 1: Cập nhật mô tả tiếng Việt có dấu + trailer cho 20 phim hiện tại ===');

  for (const [title, data] of Object.entries(movieData)) {
    const r = await c.query(
      'UPDATE movies SET description = $1, trailer_url = $2 WHERE title = $3',
      [data.desc, data.trailer, title]
    );
    if (r.rowCount > 0) console.error(`  Cập nhật: ${title}`);
  }

  // Also update Humans (already in DB from first batch)
  const humansCheck = await c.query("SELECT movie_id FROM movies WHERE title = 'Humans'");
  if (humansCheck.rows.length > 0) {
    const h = movieData['Humans'];
    const r = await c.query(
      'UPDATE movies SET description = $1, trailer_url = $2 WHERE title = $3',
      [h.desc, h.trailer, 'Humans']
    );
    if (r.rowCount > 0) console.error(`  Cập nhật: Humans`);
  }

  // =========== BƯỚC 2: Lấy danh sách phim hiện tại để tránh trùng ===========
  console.error('\n=== Bước 2: Kiểm tra phim hiện có ===');
  const existingResult = await c.query("SELECT title FROM movies");
  const existingTitles = new Set(existingResult.rows.map(r => r.title.toLowerCase().trim()));
  console.error(`Phim hiện tại: ${existingTitles.size}`);

  // Lấy danh sách genres
  const genresResult = await c.query('SELECT genre_id, name, slug FROM genres');
  const slugToGenreId = new Map(genresResult.rows.map(r => [r.slug, r.genre_id]));
  const existingGenreNames = new Set(genresResult.rows.map(r => r.name));

  function getGenreId(tvmazeGenre) {
    const slug = TVMAZE_TO_SLUG[tvmazeGenre];
    if (slug && slugToGenreId.has(slug)) return slugToGenreId.get(slug);
    return null;
  }

  // Lấy max movie_id
  const maxIdResult = await c.query("SELECT movie_id::text FROM movies ORDER BY movie_id::text DESC LIMIT 1");
  let movieCounter = 21; // tiếp tục từ ID 21
  if (maxIdResult.rows.length > 0) {
    const lastId = maxIdResult.rows[0].movie_id;
    const match = lastId.match(/(\d+)$/);
    if (match) movieCounter = parseInt(match[1]) + 1;
  }
  console.error(`Bắt đầu movie index: ${movieCounter}`);

  // =========== BƯỚC 3: Thêm 30 phim mới từ danh sách ===========
  console.error('\n=== Bước 3: Thêm 30 phim mới ===');

  // Kiểm tra xem phim đã tồn tại chưa (tránh trùng lặp)
  const filteredNew = newMovieData.filter(m => !existingTitles.has(m.title.toLowerCase().trim()));
  console.error(`Sẽ thêm: ${filteredNew.length} phim (đã loại trùng)`);

  if (filteredNew.length === 0) {
    console.error('Tất cả phim đều đã tồn tại');
    await c.end();
    return;
  }

  let idx = 0;
  for (const movie of filteredNew) {
    idx++;
    const movieId = `c0000003-0000-0000-0000-${String(movieCounter).padStart(12, '0')}`;
    movieCounter++;

    const ageRating = 'T13';
    const trailerUrl = movie.trailer || null;

    await c.query(
      `INSERT INTO movies (movie_id, title, description, duration, language, age_rating, trailer_url, poster_url, showing_start_date, showing_end_date, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       ON CONFLICT (movie_id) DO NOTHING`,
      [movieId, movie.title, movie.desc, 60, 'Tiếng Anh', ageRating,
       trailerUrl, `https://picsum.photos/seed/movie${idx+20}/300/450`,
       '2026-06-15', '2026-08-31', 'ACTIVE']
    );

    // Gán thể loại Drama
    const dramaId = slugToGenreId.get('chinh-kich');
    if (dramaId) {
      await c.query(
        'INSERT INTO movie_genres (movie_id, genre_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [movieId, dramaId]
      );
    }

    console.error(`  ${idx}. ${movie.title}`);
  }

  console.error(`\nThành công! Đã thêm ${idx} phim mới.`);

  // =========== KIỂM TRA ===========
  const final = await c.query("SELECT COUNT(*) as cnt FROM movies");
  console.error(`Tổng số phim trong DB: ${final.rows[0].cnt}`);

  await c.end();
}

main().catch(e => { console.error('Lỗi nghiêm trọng:', e.message); process.exit(1); });
