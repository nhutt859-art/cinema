const { Client } = require('pg');

async function main() {
  const c = new Client({
    host: 'localhost', port: 5432,
    database: 'cinema_db', user: 'postgres',
    password: '20040608Tm.n',
  });
  await c.connect();

  const updates = [
    {
      title: 'Friday Night Lights',
      desc: 'Tai thi tran Dillon, Texas, bong da la ca mot ton giao. Huan luyen vien truong Eric Taylor phai chiu ap luc lon khi danh bong Dillon Panthers buoc vao mua giai moi giua nhung ky vong vo cung lon ve chuc vo dich.'
    },
    {
      title: 'Westworld',
      desc: 'Westworld la mot cau chuyen u toi ve su khai minh cua y thuc nhan tao va su tien hoa cua toi loi. Lay boi canh tai diem giao thoa giua tuong lai gan va qua khu tai hien, bo phim kham pha mot the gioi noi moi ham muon cua con nguoi, du cao quy hay doi truy, deu co the duoc thoa man.'
    },
    {
      title: 'Death in Paradise',
      desc: 'Nhung vu an mang va ruou mojito. Mot thanh tra nguoi Anh vua dat chan len hon dao Caribe xinh dep Saint Marie de gia nhap luc luong canh sat noi day.'
    },
    {
      title: 'Freaks and Geeks',
      desc: 'Bo phim tung giai Emmy ke ve nhung thu thach va niem vui cua nhung hoc sinh trung hoc bi co lap o Michigan nhung nam 1980.'
    },
    {
      title: 'Private Practice',
      desc: 'Cau chuyen ve mot nhom bac si tai gio cung nhau lam viec de thay doi cuoc song benh nhan tot dep hon. Cac bac si cua Seaside Health and Wellness xu ly nhung ca benh kho khan nhat, nhung van de y te thuong dat ra nhung tinh huong nan giai ve dao duc.'
    },
    {
      title: 'Strike Back',
      desc: 'Strike Back la loat phim hanh dong quan su Anh-My, theo chan cac hoat dong coua Tieu doi 20, mot nhanh bi mat coa Co quan Tinh bao Quoc phong Anh, thuc hien nhung nhiem vu nguy hiem tren toan cau.'
    },
    {
      title: 'Being Human',
      desc: 'Bo phim hai chinh kich ve ba nguoi ban cung phong dang co gang song cuoc song binh thuong, mac du phai vat lon voi nhung tai uoc ky la mot nguoi la ngua soi, mot nguoi la ma ca tang va mot nguoi la ma.'
    },
    {
      title: 'Beverly Hills, 90210',
      desc: 'Loat phim chinh kich dai hoi ke ve trai nghiem cua mot nhom ban tre o Beverly Hills, California, khi ho trai qua thoi trung hoc, dai hoc va cuoi cung la the gioi thuc su, doi mat voi nhung moi tinh, bi kich gia dinh va nhung con nghien.'
    },
    {
      title: 'Knight Rider',
      desc: 'Michael Knight, mot thanh tra tuong chung da chet, duoc tao mot khuon mat va danh tinh moi. Nhiem vu cua anh: chien dau chong toi pham voi su giup do cua chiec xe hoi thong minh K.I.T.T., mot vu khi toc do cao duoc trang bi cong nghe tuong lai.'
    },
    {
      title: 'Dawson\'s Creek',
      desc: 'Dawson Leery, Joey Potter va Pacey Witter la nhung nguoi ban than tu nho. Cuoc song cua ho bat dau thay doi nhanh chong khi co gai moi Jen Lindley chuyen den o ben canh va ca bon buoc vao truong trung hoc.'
    },
    {
      title: 'Pushing Daisies',
      desc: 'Mot nguoi lam banh co kha nang dac biet co the cham vao nguoi chet de ho song lai. Khi tai su dung nang luc nay, anh vo tinh lam thay doi cuoc song cua nhung nguoi xung quanh.'
    },
    {
      title: 'Magnum P.I.',
      desc: 'Thomas Magnum, mot cuc quan nhan Navy, lam viec nhu mot dieu vien tu nhan tai Hawaii. Anh song tren khu bat dong sang trong cua mot tac gia giàu co va giai quyet nhung vu an hinh su bang phong cach rieng.'
    },
    {
      title: 'Hawaii Five-O',
      desc: 'Mot doi dac nhiem tinh nop cua Hawaii chien dau chong lai toi pham va bao ve cong ly tren quoc dao. Duoc dan dau boi Steve McGarrett, ho xu ly nhung vu an nghiem trong nhat ma canh sat dia phuong khong the giai quyet.'
    },
    {
      title: 'Camelot',
      desc: 'Cau chuyen huyen thoai ve Vuong quoc Camelot, noi Vuong Arthur va cac hiep si Ban Tron cung nhau xay dung mot vuong quoc cong bang va hoa binh giua nhung the luc ham muon quyen luc.'
    },
    {
      title: 'Tru Calling',
      desc: 'Tru Davies, mot sinh vien y khoa, nhan duoc mot cong viec tai nha xac. Co phat hien ra minh co kha nang dac biet: co the quay nguoc thoi gian de cuu song nguoi chet sau khi nghe nhung loi cau xin giup do tu cac thiet the vo tri.'
    },
    {
      title: 'V',
      desc: 'Nhung nguoi ngoai hanh tinh mang hinh dang con nguoi den Trai Dat trong hoa binh, nhung dung sau do la mot am muu xam luoc nguy hiem. Mot nhom nguoi khang chiec phai chien dau de boi lo su that va bao ve nhan loai.'
    },
    {
      title: 'Baywatch',
      desc: 'Loat phim kinh dien ve doi cuu ho bon bien o bai bien Los Angeles County. Nhung nguoi cuu ho khong chi chien dau voi song to gio lon ma con doi mat voi toi pham va nhung tinh huong nguy hiem khac.'
    },
    {
      title: 'Agatha Christie\'s Poirot',
      desc: 'Tham tu tai ba Hercule Poirot voi bo ria dep nhat nuoc Anh giai quyet nhung vu an hinh su phuc tap nhat. Duoc chuyen the tu tieu thuyet kinh dien cua Agatha Christie.'
    },
    {
      title: 'Good Witch',
      desc: 'Cassie Nightingale, mot nguoi phu nu bi an voi suc manh tam linh dac biet, mo mot cua hang phep thuat tai thi tran Middletown. Co su dung tai nang cua minh de giup do moi nguoi va mang lai niem vui cho cong dong.'
    },
    {
      title: 'Low Winter Sun',
      desc: 'Mot cau chuyen toi pham day cang thang lay boi canh thanh pho Detroit. Khi mot ca sat xay ra trong luc tu ve, mot thanh tra va mot ten toi pham bi cuon vao mot vong xoay bao thu va phan boi.'
    }
  ];

  for (const u of updates) {
    const r = await c.query(
      "UPDATE movies SET description = $1 WHERE title = $2",
      [u.desc, u.title]
    );
    if (r.rowCount > 0) {
      console.log(`  ${u.title}`);
    }
  }

  console.log('\nDone! Updated descriptions to Vietnamese.');
  await c.end();
}

main().catch(e => { console.error('Error:', e.message); process.exit(1); });
