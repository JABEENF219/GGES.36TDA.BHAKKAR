/* ==========================================================================
   GGES 36 TDA BHAKKAR — Cloud data store
   Backend  : Supabase (Postgres + Auth + Realtime + Storage)
   Frontend : in-memory cache + optimistic writes + live sync
   ========================================================================== */
(function (global) {
  'use strict';

  /* ------------------------------------------------------------ connection */
  var SUPABASE_URL = 'https://vttxnzwpmffluuqicpbu.supabase.co';
  var SUPABASE_KEY = 'sb_publishable_PiGA1n_mrdfU1iuiIcVeWA_E6RQ13UE';
  var BUCKET = 'media';

  var NS = 'gges36';
  var THEME_KEY = NS + ':theme';
  var LANG_KEY = NS + ':lang';

  var COLLECTIONS = ['notices', 'admissions', 'students', 'teachers', 'results', 'gallery', 'messages', 'activity'];

  if (!global.supabase || !global.supabase.createClient) {
    console.error('[GGES] Supabase library not loaded. assets/js/vendor/supabase.js must be included before store.js');
  }

  var sb = global.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: true, autoRefreshToken: true }
  });

  /* ------------------------------------------------------------------ utils */
  function uid(prefix) {
    var s = '';
    if (global.crypto && global.crypto.getRandomValues) {
      var a = new Uint8Array(8);
      global.crypto.getRandomValues(a);
      for (var i = 0; i < a.length; i++) s += ('0' + a[i].toString(16)).slice(-2);
    } else {
      s = Math.random().toString(16).slice(2, 12) + Date.now().toString(16);
    }
    return (prefix || 'id') + '_' + s;
  }

  function nowISO() { return new Date().toISOString(); }

  function deepClone(v) { return v === undefined ? v : JSON.parse(JSON.stringify(v)); }

  function todayISO() { return new Date().toISOString().slice(0, 10); }

  /* ----------------------------------------------------------- seed content */
  function seedDatabase() {
    var d = new Date();
    var y = d.getFullYear();
    function ago(n) { var x = new Date(d.getTime() - n * 86400000); return x.toISOString().slice(0, 10); }

    return {
      settings: {
        schoolName: 'GGES 36 TDA BHAKKAR',
        schoolNameUr: 'جی جی ای ایس 36 ٹی ڈی اے بھکر',
        tagline: 'Government Girls Elementary School, 36 TDA, Bhakkar',
        taglineUr: 'گورنمنٹ گرلز ایلیمنٹری اسکول، 36 ٹی ڈی اے، بھکر',
        address: 'Chak 36 TDA, Tehsil & District Bhakkar, Punjab, Pakistan',
        addressUr: 'چک 36 ٹی ڈی اے، تحصیل و ضلع بھکر، پنجاب، پاکستان',
        phone: '+92 300 000 0000',
        email: 'info@gges36bhakkar.edu.pk',
        established: '1985',
        principalName: 'Mrs. Ayesha Khan',
        principalNameUr: 'محترمہ عائشہ خان',
        officeHours: 'Monday – Saturday, 8:00 AM – 1:30 PM',
        officeHoursUr: 'پیر تا ہفتہ، صبح 8:00 تا دوپہر 1:30',
        motto: 'Knowledge · Character · Service',
        mottoUr: 'علم · کردار · خدمت',
        logoData: '',
        heroImage: '',
        aboutShort: 'GGES 36 TDA Bhakkar is a government girls elementary school committed to quality education, moral training and equal opportunity for every girl child of the area.',
        aboutShortUr: 'جی جی ای ایس 36 ٹی ڈی اے بھکر ایک سرکاری گرلز ایلیمنٹری اسکول ہے جو علاقے کی ہر بچی کے لیے معیاری تعلیم، اخلاقی تربیت اور یکساں مواقع کا عزم رکھتا ہے۔',
        aboutLong: 'Established in 1985, GGES 36 TDA Bhakkar has served generations of families in the Bhakkar district. The school provides free elementary education from Nursery to Class 8 under the School Education Department, Government of Punjab. Our campus includes well-ventilated classrooms, a library, a computer lab, a science corner and a safe playground. Alongside academics, we lay strong emphasis on character building, cleanliness, discipline and co-curricular activities such as speech contests, quiz competitions and sports.',
        stats: { students: 640, teachers: 18, classes: 9, passRate: 96 }
      },
      notices: [
        {
          title: 'Admissions Open for Session ' + y + '-' + (y + 1),
          titleUr: 'سیشن ' + y + '-' + (y + 1) + ' کے لیے داخلے جاری',
          body: 'Online admission forms for Nursery to Class 8 are now available. Parents may submit the form on the website or collect a printed form from the school office. Last date to apply is 30 April.',
          bodyUr: 'نرسری تا جماعت ہشتم کے لیے آن لائن داخلہ فارم دستیاب ہیں۔ والدین ویب سائٹ پر فارم جمع کروا سکتے ہیں یا اسکول دفتر سے پرنٹ شدہ فارم لے سکتے ہیں۔ درخواست کی آخری تاریخ 30 اپریل ہے۔',
          category: 'Admissions', pinned: true, date: ago(2), author: 'Principal Office'
        },
        {
          title: 'Annual Result Announcement',
          titleUr: 'سالانہ نتائج کا اعلان',
          body: 'Annual examination results for all classes have been announced. Parents are requested to attend the parent-teacher meeting on Saturday at 10:00 AM to collect the result cards.',
          bodyUr: 'تمام جماعتوں کے سالانہ امتحانات کے نتائج کا اعلان کر دیا گیا ہے۔ والدین سے گزارش ہے کہ ہفتہ بروز ہفتہ صبح 10:00 بجے والدین اساتذہ میٹنگ میں شرکت کر کے رزلٹ کارڈ وصول کریں۔',
          category: 'Examination', pinned: false, date: ago(6), author: 'Exam Committee'
        },
        {
          title: 'Free Health & Vaccination Camp',
          titleUr: 'مفت صحت و حفاظتی ٹیکوں کا کیمپ',
          body: 'In collaboration with the District Health Authority Bhakkar, a free health screening and vaccination camp will be held in the school compound. All students must bring their immunization card.',
          bodyUr: 'ڈسٹرکٹ ہیلتھ اتھارٹی بھکر کے تعاون سے اسکول کے صحن میں مفت طبی معائنہ اور ٹیکہ جات کا کیمپ لگایا جائے گا۔ تمام طالبات اپنا حفاظتی ٹیکوں کا کارڈ ساتھ لائیں۔',
          category: 'Health', pinned: false, date: ago(11), author: 'Admin'
        },
        {
          title: 'Speech Competition — Iqbal Day',
          titleUr: 'تقریری مقابلہ — یومِ اقبال',
          body: 'A bilingual speech competition on the life and message of Allama Iqbal will be held for classes 6 to 8. Interested students should register with their class teacher by 5th November.',
          bodyUr: 'علامہ اقبال کی سوانح اور پیغام پر دو لسانی تقریری مقابلہ جماعت ششم تا ہشتم کے لیے منعقد ہوگا۔ دلچسپی رکھنے والی طالبات 5 نومبر تک اپنی کلاس ٹیچر سے رجسٹریشن کروا لیں۔',
          category: 'Events', pinned: false, date: ago(16), author: 'Co-curricular Wing'
        }
      ],
      teachers: [
        { name: 'Mrs. Ayesha Khan', nameUr: 'محترمہ عائشہ خان', role: 'Headmistress', roleUr: 'ہیڈ مسٹریس', subject: 'Urdu', qualification: 'M.A Urdu, B.Ed', qualificationUr: 'ایم اے اردو، بی ایڈ', since: '2004', phone: '', photo: '' },
        { name: 'Ms. Sadia Bibi', nameUr: 'مس سعدیہ بی بی', role: 'Senior Teacher', roleUr: 'سینئر ٹیچر', subject: 'Mathematics', qualification: 'M.Sc Mathematics, B.Ed', qualificationUr: 'ایم ایس سی ریاضی، بی ایڈ', since: '2009', phone: '', photo: '' },
        { name: 'Ms. Hina Tariq', nameUr: 'مس حنا طارق', role: 'Teacher', roleUr: 'ٹیچر', subject: 'English', qualification: 'M.A English', qualificationUr: 'ایم اے انگلش', since: '2013', phone: '', photo: '' },
        { name: 'Ms. Nazia Parveen', nameUr: 'مس نازیہ پروین', role: 'Teacher', roleUr: 'ٹیچر', subject: 'Science', qualification: 'B.Sc, B.Ed', qualificationUr: 'بی ایس سی، بی ایڈ', since: '2015', phone: '', photo: '' },
        { name: 'Ms. Rabia Aslam', nameUr: 'مس رابعہ اسلم', role: 'Teacher', roleUr: 'ٹیچر', subject: 'Islamiat', qualification: 'M.A Islamiat, B.Ed', qualificationUr: 'ایم اے اسلاميات، بی ایڈ', since: '2016', phone: '', photo: '' },
        { name: 'Ms. Farah Deeba', nameUr: 'مس فرح دیبا', role: 'Computer Instructor', roleUr: 'کمپیوٹر انسٹرکٹر', subject: 'Computer Science', qualification: 'BS Computer Science', qualificationUr: 'بی ایس کمپیوٹر سائنس', since: '2019', phone: '', photo: '' }
      ],
      students: [
        { rollNo: '101', name: 'Areeba Fatima', nameUr: 'ارباب فاطمہ', fatherName: 'Muhammad Akram', className: '8', section: 'A', gender: 'Female', dob: '2012-03-14', phone: '', address: 'Chak 36 TDA, Bhakkar', photo: '', status: 'Active' },
        { rollNo: '102', name: 'Maryam Noor', nameUr: 'مریم نور', fatherName: 'Noor Muhammad', className: '8', section: 'A', gender: 'Female', dob: '2012-07-02', phone: '', address: 'Chak 36 TDA, Bhakkar', photo: '', status: 'Active' },
        { rollNo: '201', name: 'Hafsa Bibi', nameUr: 'حفصہ بی بی', fatherName: 'Ghulam Abbas', className: '7', section: 'A', gender: 'Female', dob: '2013-01-21', phone: '', address: 'Bhakkar City', photo: '', status: 'Active' },
        { rollNo: '202', name: 'Laiba Khan', nameUr: 'لائبہ خان', fatherName: 'Shahid Khan', className: '7', section: 'B', gender: 'Female', dob: '2013-05-09', phone: '', address: 'Chak 34 TDA', photo: '', status: 'Active' },
        { rollNo: '301', name: 'Zainab Riaz', nameUr: 'زینب ریاض', fatherName: 'Riaz Hussain', className: '6', section: 'A', gender: 'Female', dob: '2014-02-18', phone: '', address: 'Chak 36 TDA, Bhakkar', photo: '', status: 'Active' },
        { rollNo: '302', name: 'Ayesha Siddiqa', nameUr: 'عائشہ صدیقہ', fatherName: 'Abdul Sattar', className: '6', section: 'B', gender: 'Female', dob: '2014-09-30', phone: '', address: 'Jandanwala Road', photo: '', status: 'Active' },
        { rollNo: '401', name: 'Sana Ullah', nameUr: 'ثنا اللہ', fatherName: 'Fayyaz Ahmad', className: '5', section: 'A', gender: 'Female', dob: '2015-04-11', phone: '', address: 'Chak 37 TDA', photo: '', status: 'Active' },
        { rollNo: '501', name: 'Iqra Bashir', nameUr: 'اقراء بشیر', fatherName: 'Bashir Ahmad', className: '4', section: 'A', gender: 'Female', dob: '2016-06-25', phone: '', address: 'Chak 36 TDA, Bhakkar', photo: '', status: 'Active' }
      ],
      results: [
        { studentId: '', rollNo: '101', studentName: 'Areeba Fatima', className: '8', exam: 'Annual ' + y, year: String(y), totalMarks: 700, obtainedMarks: 641, grade: 'A', position: '1', remarks: 'Outstanding performance' },
        { studentId: '', rollNo: '102', studentName: 'Maryam Noor', className: '8', exam: 'Annual ' + y, year: String(y), totalMarks: 700, obtainedMarks: 602, grade: 'A', position: '2', remarks: 'Excellent' },
        { studentId: '', rollNo: '201', studentName: 'Hafsa Bibi', className: '7', exam: 'Annual ' + y, year: String(y), totalMarks: 600, obtainedMarks: 498, grade: 'B', position: '3', remarks: 'Good' },
        { studentId: '', rollNo: '202', studentName: 'Laiba Khan', className: '7', exam: 'Annual ' + y, year: String(y), totalMarks: 600, obtainedMarks: 455, grade: 'B', position: '6', remarks: 'Good effort' },
        { studentId: '', rollNo: '301', studentName: 'Zainab Riaz', className: '6', exam: 'Annual ' + y, year: String(y), totalMarks: 500, obtainedMarks: 431, grade: 'A', position: '1', remarks: 'Excellent' },
        { studentId: '', rollNo: '501', studentName: 'Iqra Bashir', className: '4', exam: 'Annual ' + y, year: String(y), totalMarks: 400, obtainedMarks: 276, grade: 'C', position: '12', remarks: 'Needs improvement in Mathematics' }
      ],
      gallery: [
        { title: 'School Main Gate', titleUr: 'اسکول کا مرکزی دروازہ', category: 'Campus', src: 'assets/images/school-gate.jpeg', date: ago(5) },
        { title: 'Morning Assembly', titleUr: 'صبح کی اسمبلی', category: 'Campus', src: 'assets/images/assembly-ground.jpeg', date: ago(5) },
        { title: 'Classroom Session', titleUr: 'کلاس روم کا سیشن', category: 'Academics', src: 'assets/images/classroom.jpeg', date: ago(8) },
        { title: 'School Library Corner', titleUr: 'اسکول لائبریری کا گوشہ', category: 'Facilities', src: 'assets/images/school-library.jpeg', date: ago(12) },
        { title: 'Outdoor Activity 1', titleUr: 'بیرونی سرگرمی', category: 'Sports', src: 'assets/images/outdoor-activity-1.jpeg', date: ago(18) },
        { title: 'Outdoor Activity 2', titleUr: 'طلبہ کی بیرونی سرگرمی', category: 'Sports', src: 'assets/images/outdoor-activity-2.jpeg', date: ago(22) },
        { title: 'Outdoor Activity 3', titleUr: 'اسکول کی بیرونی سرگرمی', category: 'Sports', src: 'assets/images/outdoor-activity-3.jpeg', date: ago(26) },
        { title: 'Prize Distribution', titleUr: 'انعامات کی تقسیم', category: 'Events', src: 'assets/images/prize-distribution.jpeg', date: ago(30) },
        { title: 'Prize Distribution Ceremony', titleUr: 'تقریبِ تقسیمِ انعامات', category: 'Events', src: 'assets/images/prize-distribution-2.jpeg', date: ago(34) }
      ],
      admissions: [],
      messages: [],
      activity: []
    };
  }

  var DEFAULT_SETTINGS = seedDatabase().settings;

  /* ------------------------------------------------------------ local cache */
  var cache = { settings: Object.assign({}, DEFAULT_SETTINGS) };
  COLLECTIONS.forEach(function (c) { cache[c] = []; });

  var booted = false;
  var currentSession = null;
  var authResolved = false;
  var listeners = [];
  var authListeners = [];

  function emit(collection, remote) {
    listeners.slice().forEach(function (l) {
      if (l.collection === '*' || collection === '*' || l.collection === collection) {
        try { l.cb(cache, { collection: collection, remote: !!remote }); }
        catch (e) { console.error('[GGES] listener error', e); }
      }
    });
  }

  function emitAuth() {
    authListeners.slice().forEach(function (cb) {
      try { cb(Store.session()); } catch (e) { console.error('[GGES] auth listener error', e); }
    });
  }

  /* ---------------------------------------------------------------- loading */
  function fetchCollection(collection) {
    return sb.from('items')
      .select('id,data,created_at,updated_at')
      .eq('collection', collection)
      .order('created_at', { ascending: false })
      .then(function (res) {
        if (res.error) throw res.error;
        var list = (res.data || []).map(function (row) {
          var item = Object.assign({}, row.data || {});
          item.id = row.id;
          if (!item.createdAt) item.createdAt = row.created_at;
          if (!item.updatedAt) item.updatedAt = row.updated_at;
          return item;
        });
        cache[collection] = list;
        return list;
      });
  }

  function refreshCollection(collection) {
    return fetchCollection(collection)
      .then(function () { emit(collection, true); })
      .catch(function (e) { console.warn('[GGES] could not refresh ' + collection, e.message || e); });
  }

  function fetchSettings() {
    return sb.from('settings').select('data').eq('id', 1).maybeSingle().then(function (res) {
      if (res.error) throw res.error;
      if (res.data && res.data.data) {
        cache.settings = Object.assign({}, DEFAULT_SETTINGS, res.data.data);
      }
      return cache.settings;
    });
  }

  function loadAll() {
    return Promise.all(COLLECTIONS.map(fetchCollection))
      .then(function () { return fetchSettings(); })
      .then(function () {
        booted = true;
        emit('*');
      })
      .catch(function (e) {
        console.error('[GGES] could not load data from the cloud', e);
        booted = true;
        emit('*');
      });
  }

  /* --------------------------------------------------------------- realtime */
  function startRealtime() {
    sb.channel('gges36-db')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'items' }, function (payload) {
        var c = (payload.new && payload.new.collection) || (payload.old && payload.old.collection);
        if (c && COLLECTIONS.indexOf(c) > -1) refreshCollection(c);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, function () {
        fetchSettings().then(function () { emit('settings', true); }).catch(function () {});
      })
      .subscribe(function (status) {
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.warn('[GGES] realtime channel:', status);
        }
      });

    // safety net: refresh when the visitor returns to the tab
    global.addEventListener('focus', function () {
      if (!booted) return;
      loadAll();
    });
  }

  /* ------------------------------------------------------------------- auth */
  function startAuth() {
    sb.auth.getSession().then(function (res) {
      currentSession = (res.data && res.data.session) || null;
      authResolved = true;
      emitAuth();
      return loadAll();
    }).catch(function () {
      authResolved = true;
      emitAuth();
      loadAll();
    });

    sb.auth.onAuthStateChange(function (event, session) {
      var changed = String(!!session) !== String(!!currentSession);
      currentSession = session || null;
      authResolved = true;
      emitAuth();
      if (changed) loadAll();
    });
  }

  /* ------------------------------------------------------------------ upload */
  function compressImage(file, maxDim) {
    return new Promise(function (resolve) {
      if (!/^image\//.test(file.type) || /svg|gif/i.test(file.type)) return resolve(file);
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () {
        try {
          var w = img.naturalWidth, h = img.naturalHeight;
          var scale = Math.min(1, (maxDim || 1600) / Math.max(w, h));
          var cw = Math.max(1, Math.round(w * scale));
          var ch = Math.max(1, Math.round(h * scale));
          var canvas = document.createElement('canvas');
          canvas.width = cw; canvas.height = ch;
          canvas.getContext('2d').drawImage(img, 0, 0, cw, ch);
          canvas.toBlob(function (blob) {
            URL.revokeObjectURL(url);
            resolve(blob && blob.size < file.size ? blob : file);
          }, 'image/jpeg', 0.82);
        } catch (e) {
          URL.revokeObjectURL(url);
          resolve(file);
        }
      };
      img.onerror = function () { URL.revokeObjectURL(url); resolve(file); };
      img.src = url;
    });
  }

  function uploadImage(file, maxKB) {
    var limitKB = maxKB || 15000;
    return new Promise(function (resolve, reject) {
      if (!file) return reject(new Error('NO_FILE'));
      if (file.size > limitKB * 1024) return reject(new Error('FILE_TOO_LARGE'));
      compressImage(file, 1600).then(function (blob) {
        var ext = /png/i.test(blob.type) ? 'png' : 'jpg';
        var path = 'uploads/' + todayISO() + '-' + uid('img') + '.' + ext;
        return sb.storage.from(BUCKET).upload(path, blob, {
          contentType: blob.type || 'image/jpeg',
          upsert: false
        }).then(function (res) {
          if (res.error) throw res.error;
          var pub = sb.storage.from(BUCKET).getPublicUrl(path);
          resolve(pub.data.publicUrl);
        });
      }).catch(reject);
    });
  }

  function uploadVideo(file, maxMB) {
    var limitMB = maxMB || 48;
    return new Promise(function (resolve, reject) {
      if (!file) return reject(new Error('NO_FILE'));
      if (file.size > limitMB * 1024 * 1024) return reject(new Error('FILE_TOO_LARGE'));
      var m = String(file.name || '').match(/\.([A-Za-z0-9]{2,4})$/);
      var ext = m ? m[1].toLowerCase() : 'mp4';
      var path = 'uploads/' + todayISO() + '-' + uid('vid') + '.' + ext;
      sb.storage.from(BUCKET).upload(path, file, {
        contentType: file.type || 'video/mp4',
        upsert: false
      }).then(function (res) {
        if (res.error) throw res.error;
        var pub = sb.storage.from(BUCKET).getPublicUrl(path);
        resolve(pub.data.publicUrl);
      }).catch(reject);
    });
  }

  /* --------------------------------------------------------------- media kind */
  function youTubeId(url) {
    if (!url) return '';
    var s = String(url).trim();
    var m = s.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/|v\/))([A-Za-z0-9_-]{6,})/);
    if (m) return m[1];
    if (/^[A-Za-z0-9_-]{11}$/.test(s)) return s;
    return '';
  }

  function mediaKind(item) {
    var g = item || {};
    if (youTubeId(g.youtube) || youTubeId(g.src)) return 'youtube';
    if (g.type === 'video' || /^video\//.test(g.mime || '')) return 'video';
    if (/\.(mp4|webm|ogv|ogg|mov|m4v|avi|3gp)([?#]|$)/i.test(g.src || '')) return 'video';
    return 'photo';
  }

  function mediaPoster(item) {
    var g = item || {};
    if (mediaKind(g) === 'youtube') {
      var id = youTubeId(g.youtube) || youTubeId(g.src);
      if (id) return 'https://img.youtube.com/vi/' + id + '/hqdefault.jpg';
    }
    return g.src || '';
  }

  /* ------------------------------------------------------------------- write */
  function rollback(collection) { emit(collection); }

  function writeRow(collection, rec) {
    return sb.from('items').insert({
      id: rec.id,
      collection: collection,
      data: rec,
      created_at: rec.createdAt,
      updated_at: rec.updatedAt
    }).then(function (res) {
      if (res.error) throw res.error;
      return rec;
    });
  }

  /* ------------------------------------------------------------------- API */
  var Store = {
    /* ---------- configuration ---------- */
    NS: NS,
    COLLECTIONS: COLLECTIONS,
    uid: uid,
    todayISO: todayISO,
    nowISO: nowISO,
    client: sb,

    /* ---------- read ---------- */
    all: function (collection) { return deepClone(cache[collection] || []); },

    get: function (collection, id) {
      var list = cache[collection] || [];
      for (var i = 0; i < list.length; i++) if (list[i].id === id) return deepClone(list[i]);
      return null;
    },

    find: function (collection, predicate) {
      var list = cache[collection] || [];
      for (var i = 0; i < list.length; i++) if (predicate(list[i])) return deepClone(list[i]);
      return null;
    },

    filter: function (collection, predicate) {
      return deepClone((cache[collection] || []).filter(predicate));
    },

    settings: function () { return deepClone(cache.settings || {}); },

    count: function (collection) { return (cache[collection] || []).length; },

    isBooted: function () { return booted; },

    /* ---------- write (optimistic — the cloud write follows) ---------- */
    add: function (collection, item) {
      var rec = Object.assign({}, item);
      if (!rec.id) rec.id = uid(collection.slice(0, 3));
      if (!rec.createdAt) rec.createdAt = nowISO();
      rec.updatedAt = nowISO();

      if (!Array.isArray(cache[collection])) cache[collection] = [];
      cache[collection].unshift(rec);
      emit(collection);

      var p = writeRow(collection, rec)
        .then(function (saved) {
          Store.log('Added to ' + collection, rec.title || rec.name || rec.id);
          return saved;
        })
        .catch(function (e) {
          cache[collection] = cache[collection].filter(function (x) { return x.id !== rec.id; });
          rollback(collection);
          console.error('[GGES] save failed', e);
          throw e;
        });
      p.catch(function () {});
      return p;
    },

    update: function (collection, id, patch) {
      var list = cache[collection] || [];
      var previous = null, index = -1;
      for (var i = 0; i < list.length; i++) {
        if (list[i].id === id) { previous = list[i]; index = i; break; }
      }
      if (index < 0) return Promise.resolve(null);

      var merged = Object.assign({}, previous, patch, { updatedAt: nowISO() });
      list[index] = merged;
      emit(collection);

      var p = sb.from('items')
        .update({ data: merged, updated_at: merged.updatedAt })
        .eq('id', id)
        .then(function (res) {
          if (res.error) throw res.error;
          Store.log('Updated ' + collection, merged.title || merged.name || id);
          return deepClone(merged);
        })
        .catch(function (e) {
          if (previous) cache[collection][index] = previous;
          rollback(collection);
          console.error('[GGES] update failed', e);
          throw e;
        });
      p.catch(function () {});
      return p;
    },

    remove: function (collection, id) {
      var list = cache[collection] || [];
      var previous = null, index = -1;
      for (var i = 0; i < list.length; i++) {
        if (list[i].id === id) { previous = list[i]; index = i; break; }
      }
      if (index < 0) return Promise.resolve(false);

      list.splice(index, 1);
      emit(collection);

      var p = sb.from('items').delete().eq('id', id)
        .then(function (res) {
          if (res.error) throw res.error;
          Store.log('Deleted from ' + collection, id);
          return true;
        })
        .catch(function (e) {
          if (previous) cache[collection].splice(index, 0, previous);
          rollback(collection);
          console.error('[GGES] delete failed', e);
          throw e;
        });
      p.catch(function () {});
      return p;
    },

    saveSettings: function (patch) {
      cache.settings = Object.assign({}, cache.settings, patch, { updatedAt: nowISO() });
      emit('settings');

      var p = sb.from('settings')
        .update({ data: cache.settings, updated_at: nowISO() })
        .eq('id', 1)
        .then(function (res) {
          if (res.error) throw res.error;
          return deepClone(cache.settings);
        })
        .catch(function (e) {
          console.error('[GGES] settings save failed', e);
          throw e;
        });
      p.catch(function () {});
      return p;
    },

    /* keeps a readable history for the admin dashboard */
    log: function (action, detail) {
      if (!currentSession) return Promise.resolve(null);
      var entry = { id: uid('act'), action: action, detail: detail || '', at: nowISO() };
      if (!Array.isArray(cache.activity)) cache.activity = [];
      cache.activity.unshift(entry);
      cache.activity = cache.activity.slice(0, 60);
      emit('activity');
      return writeRow('activity', entry).catch(function () { return null; });
    },

    /* ---------- realtime ---------- */
    subscribe: function (collection, cb) {
      listeners.push({ collection: collection || '*', cb: cb });
      cb(cache, { collection: collection, remote: false });
      return function off() {
        listeners = listeners.filter(function (l) { return l.cb !== cb; });
      };
    },

    onActivity: function (cb) { return this.subscribe('activity', cb); },

    /* ---------- session / auth ---------- */
    session: function () {
      if (!currentSession || !currentSession.user) return null;
      return {
        username: currentSession.user.email,
        email: currentSession.user.email,
        role: 'admin',
        loginAt: currentSession.user.last_sign_in_at || nowISO()
      };
    },
    isAdmin: function () { return !!(currentSession && currentSession.user); },
    isAuthReady: function () { return authResolved; },

    onAuth: function (cb) {
      authListeners.push(cb);
      if (authResolved) cb(Store.session());
      return function off() {
        authListeners = authListeners.filter(function (x) { return x !== cb; });
      };
    },

    login: function (email, password) {
      return sb.auth.signInWithPassword({
        email: String(email || '').trim(),
        password: String(password || '')
      }).then(function (res) {
        if (res.error) throw res.error;
        currentSession = res.data.session;
        emitAuth();
        return loadAll().then(function () { return true; });
      }).catch(function (e) {
        console.warn('[GGES] login failed:', e.message || e);
        return false;
      });
    },

    logout: function () {
      return sb.auth.signOut().then(function () {
        currentSession = null;
        emitAuth();
        return loadAll();
      });
    },

    changePassword: function (newPassword) {
      return sb.auth.updateUser({ password: String(newPassword) }).then(function (res) {
        if (res.error) throw res.error;
        return true;
      });
    },

    /* ---------- preferences ---------- */
    getTheme: function () {
      try { return global.localStorage.getItem(THEME_KEY) || 'light'; } catch (e) { return 'light'; }
    },
    setTheme: function (t) {
      try { global.localStorage.setItem(THEME_KEY, t); } catch (e) {}
      document.documentElement.setAttribute('data-theme', t);
    },
    getLang: function () {
      try { return global.localStorage.getItem(LANG_KEY) || 'en'; } catch (e) { return 'en'; }
    },
    setLang: function (l) {
      try { global.localStorage.setItem(LANG_KEY, l); } catch (e) {}
    },

    /* ---------- backup ---------- */
    export: function () {
      var out = { settings: cache.settings };
      COLLECTIONS.forEach(function (c) { out[c] = cache[c] || []; });
      return JSON.stringify(out, null, 2);
    },

    replaceAll: function (obj) {
      var rows = [];
      COLLECTIONS.forEach(function (c) {
        (obj[c] || []).forEach(function (rec) {
          var r = Object.assign({}, rec);
          if (!r.id) r.id = uid(c.slice(0, 3));
          if (!r.createdAt) r.createdAt = nowISO();
          r.updatedAt = nowISO();
          rows.push({ id: r.id, collection: c, data: r, created_at: r.createdAt, updated_at: r.updatedAt });
        });
      });
      return sb.from('items').delete().neq('id', '__none__')
        .then(function (res) {
          if (res.error) throw res.error;
          if (!rows.length) return null;
          return sb.from('items').insert(rows).then(function (r2) {
            if (r2.error) throw r2.error;
            return null;
          });
        })
        .then(function () {
          if (obj.settings) return sb.from('settings').update({ data: obj.settings, updated_at: nowISO() }).eq('id', 1);
          return null;
        })
        .then(function () { return loadAll(); });
    },

    import: function (json) {
      var parsed = typeof json === 'string' ? JSON.parse(json) : json;
      if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.notices)) {
        return Promise.reject(new Error('INVALID_BACKUP'));
      }
      return this.replaceAll(parsed);
    },

    reset: function () {
      return this.replaceAll(seedDatabase());
    },

    /* ---------- helpers ---------- */
    gradeFor: function (pct) {
      if (pct >= 80) return 'A';
      if (pct >= 65) return 'B';
      if (pct >= 50) return 'C';
      if (pct >= 33) return 'D';
      return 'F';
    },
    formatDate: function (iso, lang) {
      if (!iso) return '';
      var dt = new Date(iso.length <= 10 ? iso + 'T00:00:00' : iso);
      if (isNaN(dt.getTime())) return iso;
      try {
        return dt.toLocaleDateString(lang === 'ur' ? 'ur-PK' : 'en-GB',
          { day: '2-digit', month: 'short', year: 'numeric' });
      } catch (e) { return dt.toDateString(); }
    },
    timeAgo: function (iso, lang) {
      var dt = new Date(iso);
      if (isNaN(dt.getTime())) return '';
      var s = Math.floor((Date.now() - dt.getTime()) / 1000);
      if (s < 60) return lang === 'ur' ? 'ابھی' : 'just now';
      var m = Math.floor(s / 60), h = Math.floor(m / 60), d = Math.floor(h / 24);
      if (lang === 'ur') {
        if (m < 60) return m + ' منٹ پہلے';
        if (h < 24) return h + ' گھنٹے پہلے';
        if (d < 30) return d + ' دن پہلے';
        return Math.floor(d / 30) + ' ماہ پہلے';
      }
      if (m < 60) return m + ' min ago';
      if (h < 24) return h + (h === 1 ? ' hour ago' : ' hours ago');
      if (d < 30) return d + (d === 1 ? ' day ago' : ' days ago');
      return Math.floor(d / 30) + ' months ago';
    },
    initials: function (name) {
      if (!name) return '?';
      return name.trim().split(/\s+/).slice(0, 2).map(function (w) { return w.charAt(0); }).join('').toUpperCase();
    },
    escape: function (str) {
      if (str === null || str === undefined) return '';
      return String(str).replace(/[&<>"']/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
      });
    },

    /* compresses the picture, uploads it to the cloud and resolves its public URL */
    uploadImage: uploadImage,
    readFileAsDataURL: uploadImage,
    /* uploads a video file unchanged and resolves its public URL */
    uploadVideo: uploadVideo,

    youTubeId: youTubeId,
    mediaKind: mediaKind,
    mediaPoster: mediaPoster,

    download: function (filename, text) {
      var blob = new Blob([text], { type: 'application/json' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
    }
  };

  global.Store = Store;

  /* -------------------------------------------------------------- bootstrap */
  startRealtime();
  startAuth();

})(window);
