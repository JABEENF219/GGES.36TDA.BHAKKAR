/* ==========================================================================
   GGES 36 TDA BHAKKAR — Realtime Data Store
   Storage  : localStorage (persistent, offline)
   Realtime : BroadcastChannel + storage event (live sync across all tabs)
   ========================================================================== */
(function (global) {
  'use strict';

  var NS = 'gges36';
  var DB_KEY = NS + ':db';
  var SESSION_KEY = NS + ':session';
  var THEME_KEY = NS + ':theme';
  var LANG_KEY = NS + ':lang';
  var CHANNEL = NS + ':channel';

  var COLLECTIONS = ['notices', 'admissions', 'students', 'teachers', 'results', 'gallery', 'messages', 'activity'];

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

  /* ---------------------------------------------------------------- seed DB */
  function seedDatabase() {
    var d = new Date();
    var y = d.getFullYear();
    function ago(n) { var x = new Date(d.getTime() - n * 86400000); return x.toISOString().slice(0, 10); }

    return {
      meta: { version: 1, createdAt: nowISO(), updatedAt: nowISO() },
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
          id: uid('ntc'), title: 'Admissions Open for Session ' + y + '-' + (y + 1),
          titleUr: 'سیشن ' + y + '-' + (y + 1) + ' کے لیے داخلے جاری',
          body: 'Online admission forms for Nursery to Class 8 are now available. Parents may submit the form on the website or collect a printed form from the school office. Last date to apply is 30 April.',
          bodyUr: 'نرسری تا جماعت ہشتم کے لیے آن لائن داخلہ فارم دستیاب ہیں۔ والدین ویب سائٹ پر فارم جمع کروا سکتے ہیں یا اسکول دفتر سے پرنٹ شدہ فارم لے سکتے ہیں۔ درخواست کی آخری تاریخ 30 اپریل ہے۔',
          category: 'Admissions', pinned: true, date: ago(2), author: 'Principal Office'
        },
        {
          id: uid('ntc'), title: 'Annual Result Announcement',
          titleUr: 'سالانہ نتائج کا اعلان',
          body: 'Annual examination results for all classes have been announced. Parents are requested to attend the parent-teacher meeting on Saturday at 10:00 AM to collect the result cards.',
          bodyUr: 'تمام جماعتوں کے سالانہ امتحانات کے نتائج کا اعلان کر دیا گیا ہے۔ والدین سے گزارش ہے کہ ہفتہ بروز ہفتہ صبح 10:00 بجے والدین اساتذہ میٹنگ میں شرکت کر کے رزلٹ کارڈ وصول کریں۔',
          category: 'Examination', pinned: false, date: ago(6), author: 'Exam Committee'
        },
        {
          id: uid('ntc'), title: 'Free Health & Vaccination Camp',
          titleUr: 'مفت صحت و حفاظتی ٹیکوں کا کیمپ',
          body: 'In collaboration with the District Health Authority Bhakkar, a free health screening and vaccination camp will be held in the school compound. All students must bring their immunization card.',
          bodyUr: 'ڈسٹرکٹ ہیلتھ اتھارٹی بھکر کے تعاون سے اسکول کے صحن میں مفت طبی معائنہ اور ٹیکہ جات کا کیمپ لگایا جائے گا۔ تمام طالبات اپنا حفاظتی ٹیکوں کا کارڈ ساتھ لائیں۔',
          category: 'Health', pinned: false, date: ago(11), author: 'Admin'
        },
        {
          id: uid('ntc'), title: 'Speech Competition — Iqbal Day',
          titleUr: 'تقریری مقابلہ — یومِ اقبال',
          body: 'A bilingual speech competition on the life and message of Allama Iqbal will be held for classes 6 to 8. Interested students should register with their class teacher by 5th November.',
          bodyUr: 'علامہ اقبال کی سوانح اور پیغام پر دو لسانی تقریری مقابلہ جماعت ششم تا ہشتم کے لیے منعقد ہوگا۔ دلچسپی رکھنے والی طالبات 5 نومبر تک اپنی کلاس ٹیچر سے رجسٹریشن کروا لیں۔',
          category: 'Events', pinned: false, date: ago(16), author: 'Co-curricular Wing'
        }
      ],
      teachers: [
        { id: uid('tch'), name: 'Mrs. Ayesha Khan', nameUr: 'محترمہ عائشہ خان', role: 'Headmistress', roleUr: 'ہیڈ مسٹریس', subject: 'Urdu', qualification: 'M.A Urdu, B.Ed', qualificationUr: 'ایم اے اردو، بی ایڈ', since: '2004', phone: '', photo: '' },
        { id: uid('tch'), name: 'Ms. Sadia Bibi', nameUr: 'مس سعدیہ بی بی', role: 'Senior Teacher', roleUr: 'سینئر ٹیچر', subject: 'Mathematics', qualification: 'M.Sc Mathematics, B.Ed', qualificationUr: 'ایم ایس سی ریاضی، بی ایڈ', since: '2009', phone: '', photo: '' },
        { id: uid('tch'), name: 'Ms. Hina Tariq', nameUr: 'مس حنا طارق', role: 'Teacher', roleUr: 'ٹیچر', subject: 'English', qualification: 'M.A English', qualificationUr: 'ایم اے انگلش', since: '2013', phone: '', photo: '' },
        { id: uid('tch'), name: 'Ms. Nazia Parveen', nameUr: 'مس نازیہ پروین', role: 'Teacher', roleUr: 'ٹیچر', subject: 'Science', qualification: 'B.Sc, B.Ed', qualificationUr: 'بی ایس سی، بی ایڈ', since: '2015', phone: '', photo: '' },
        { id: uid('tch'), name: 'Ms. Rabia Aslam', nameUr: 'مس رابعہ اسلم', role: 'Teacher', roleUr: 'ٹیچر', subject: 'Islamiat', qualification: 'M.A Islamiat, B.Ed', qualificationUr: 'ایم اے اسلاميات، بی ایڈ', since: '2016', phone: '', photo: '' },
        { id: uid('tch'), name: 'Ms. Farah Deeba', nameUr: 'مس فرح دیبا', role: 'Computer Instructor', roleUr: 'کمپیوٹر انسٹرکٹر', subject: 'Computer Science', qualification: 'BS Computer Science', qualificationUr: 'بی ایس کمپیوٹر سائنس', since: '2019', phone: '', photo: '' }
      ],
      students: [
        { id: uid('std'), rollNo: '101', name: 'Areeba Fatima', nameUr: 'ارباب فاطمہ', fatherName: 'Muhammad Akram', className: '8', section: 'A', gender: 'Female', dob: '2012-03-14', phone: '', address: 'Chak 36 TDA, Bhakkar', photo: '', status: 'Active' },
        { id: uid('std'), rollNo: '102', name: 'Maryam Noor', nameUr: 'مریم نور', fatherName: 'Noor Muhammad', className: '8', section: 'A', gender: 'Female', dob: '2012-07-02', phone: '', address: 'Chak 36 TDA, Bhakkar', photo: '', status: 'Active' },
        { id: uid('std'), rollNo: '201', name: 'Hafsa Bibi', nameUr: 'حفصہ بی بی', fatherName: 'Ghulam Abbas', className: '7', section: 'A', gender: 'Female', dob: '2013-01-21', phone: '', address: 'Bhakkar City', photo: '', status: 'Active' },
        { id: uid('std'), rollNo: '202', name: 'Laiba Khan', nameUr: 'لائبہ خان', fatherName: 'Shahid Khan', className: '7', section: 'B', gender: 'Female', dob: '2013-05-09', phone: '', address: 'Chak 34 TDA', photo: '', status: 'Active' },
        { id: uid('std'), rollNo: '301', name: 'Zainab Riaz', nameUr: 'زینب ریاض', fatherName: 'Riaz Hussain', className: '6', section: 'A', gender: 'Female', dob: '2014-02-18', phone: '', address: 'Chak 36 TDA, Bhakkar', photo: '', status: 'Active' },
        { id: uid('std'), rollNo: '302', name: 'Ayesha Siddiqa', nameUr: 'عائشہ صدیقہ', fatherName: 'Abdul Sattar', className: '6', section: 'B', gender: 'Female', dob: '2014-09-30', phone: '', address: 'Jandanwala Road', photo: '', status: 'Active' },
        { id: uid('std'), rollNo: '401', name: 'Sana Ullah', nameUr: 'ثنا اللہ', fatherName: 'Fayyaz Ahmad', className: '5', section: 'A', gender: 'Female', dob: '2015-04-11', phone: '', address: 'Chak 37 TDA', photo: '', status: 'Active' },
        { id: uid('std'), rollNo: '501', name: 'Iqra Bashir', nameUr: 'اقراء بشیر', fatherName: 'Bashir Ahmad', className: '4', section: 'A', gender: 'Female', dob: '2016-06-25', phone: '', address: 'Chak 36 TDA, Bhakkar', photo: '', status: 'Active' }
      ],
      results: [
        { id: uid('res'), studentId: '', rollNo: '101', studentName: 'Areeba Fatima', className: '8', exam: 'Annual ' + y, year: String(y), totalMarks: 700, obtainedMarks: 641, grade: 'A', position: '1', remarks: 'Outstanding performance' },
        { id: uid('res'), studentId: '', rollNo: '102', studentName: 'Maryam Noor', className: '8', exam: 'Annual ' + y, year: String(y), totalMarks: 700, obtainedMarks: 602, grade: 'A', position: '2', remarks: 'Excellent' },
        { id: uid('res'), studentId: '', rollNo: '201', studentName: 'Hafsa Bibi', className: '7', exam: 'Annual ' + y, year: String(y), totalMarks: 600, obtainedMarks: 498, grade: 'B', position: '3', remarks: 'Good' },
        { id: uid('res'), studentId: '', rollNo: '202', studentName: 'Laiba Khan', className: '7', exam: 'Annual ' + y, year: String(y), totalMarks: 600, obtainedMarks: 455, grade: 'B', position: '6', remarks: 'Good effort' },
        { id: uid('res'), studentId: '', rollNo: '301', studentName: 'Zainab Riaz', className: '6', exam: 'Annual ' + y, year: String(y), totalMarks: 500, obtainedMarks: 431, grade: 'A', position: '1', remarks: 'Excellent' },
        { id: uid('res'), studentId: '', rollNo: '501', studentName: 'Iqra Bashir', className: '4', exam: 'Annual ' + y, year: String(y), totalMarks: 400, obtainedMarks: 276, grade: 'C', position: '12', remarks: 'Needs improvement in Mathematics' }
      ],
      gallery: [
        { id: uid('img'), title: 'School Main Gate', titleUr: 'اسکول کا مرکزی دروازہ', category: 'Campus', src: 'assets/images/school-gate.jpeg', date: ago(5) },
        { id: uid('img'), title: 'Morning Assembly', titleUr: 'صبح کی اسمبلی', category: 'Campus', src: 'assets/images/assembly-ground.jpeg', date: ago(5) },
        { id: uid('img'), title: 'Classroom Session', titleUr: 'کلاس روم کا سیشن', category: 'Academics', src: 'assets/images/classroom.jpeg', date: ago(8) },
        { id: uid('img'), title: 'School Library Corner', titleUr: 'اسکول لائبریری کا گوشہ', category: 'Facilities', src: 'assets/images/school-library.jpeg', date: ago(12) },
        { id: uid('img'), title: 'Outdoor Activity 1', titleUr: 'بیرونی سرگرمی', category: 'Sports', src: 'assets/images/outdoor-activity-1.jpeg', date: ago(18) },
        { id: uid('img'), title: 'Outdoor Activity 2', titleUr: 'طلبہ کی بیرونی سرگرمی', category: 'Sports', src: 'assets/images/outdoor-activity-2.jpeg', date: ago(22) },
        { id: uid('img'), title: 'Outdoor Activity 3', titleUr: 'اسکول کی بیرونی سرگرمی', category: 'Sports', src: 'assets/images/outdoor-activity-3.jpeg', date: ago(26) },
        { id: uid('img'), title: 'Prize Distribution', titleUr: 'انعامات کی تقسیم', category: 'Events', src: 'assets/images/prize-distribution.jpeg', date: ago(30) },
        { id: uid('img'), title: 'Prize Distribution Ceremony', titleUr: 'تقریبِ تقسیمِ انعامات', category: 'Events', src: 'assets/images/prize-distribution-2.jpeg', date: ago(34) }
      ],
      admissions: [],
      messages: [],
      activity: [
        { id: uid('act'), action: 'Database initialised', detail: 'Demo data loaded', at: nowISO() }
      ]
    };
  }

  /* -------------------------------------------------------------- core DB IO */
  var cache = null;

  function migrateDemoGallery(db) {
    var seedPhotos = seedDatabase().gallery;
    var changed = false;
    var gallery = (db.gallery || []).filter(function (item) {
      var src = String(item.src || '');
      if (src.indexOf('tool_text_to_image') < 0) return true;
      var replacement = seedPhotos.filter(function (photo) { return photo.title === item.title; })[0];
      changed = true;
      if (!replacement) return false;
      item.src = replacement.src;
      item.title = replacement.title;
      item.titleUr = replacement.titleUr;
      item.category = replacement.category;
      return true;
    });
    seedPhotos.forEach(function (photo) {
      if (!gallery.some(function (item) { return item.src === photo.src; })) {
        gallery.push(photo);
        changed = true;
      }
    });
    db.gallery = gallery;
    return changed;
  }
  function readDB() {
    if (cache) return cache;
    try {
      var raw = global.localStorage.getItem(DB_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        // heal missing collections
        var seed = null;
        COLLECTIONS.forEach(function (c) {
          if (!Array.isArray(parsed[c])) { seed = seed || seedDatabase(); parsed[c] = seed[c]; }
        });
        if (!parsed.settings) parsed.settings = seedDatabase().settings;
        var galleryMigrated = migrateDemoGallery(parsed);
        cache = parsed;
        if (galleryMigrated) {
          try { global.localStorage.setItem(DB_KEY, JSON.stringify(parsed)); }
          catch (storageError) { console.warn('[GGES] Could not save photo update.', storageError); }
        }
        return cache;
      }
    } catch (e) {
      console.warn('[GGES] Corrupt database, re-seeding.', e);
    }
    cache = seedDatabase();
    persist(cache, false);
    return cache;
  }

  function persist(db, broadcast) {
    db.meta = db.meta || {};
    db.meta.updatedAt = nowISO();
    cache = db;
    try {
      global.localStorage.setItem(DB_KEY, JSON.stringify(db));
    } catch (e) {
      console.error('[GGES] Storage write failed', e);
      if (typeof global.onStorageQuotaError === 'function') global.onStorageQuotaError(e);
      throw new Error('STORAGE_FULL');
    }
    if (broadcast !== false) emit('*');
  }

  /* -------------------------------------------------------------- listeners */
  var listeners = [];      // {collection, cb}
  var channel = null;
  var selfToken = uid('tab');

  try {
    if ('BroadcastChannel' in global) {
      channel = new BroadcastChannel(CHANNEL);
      channel.onmessage = function (ev) {
        if (!ev || !ev.data || ev.data.from === selfToken) return;
        cache = null;                       // force re-read from localStorage
        var db = readDB();
        emit(ev.data.collection || '*', true);
      };
    }
  } catch (e) { /* BroadcastChannel unsupported — storage event covers it */ }

  global.addEventListener('storage', function (ev) {
    if (ev.key !== DB_KEY) return;
    cache = null;
    readDB();
    emit('*', true);
  });

  function emit(collection, remote) {
    var db = cache;
    listeners.slice().forEach(function (l) {
      if (l.collection === '*' || collection === '*' || l.collection === collection) {
        try { l.cb(db, { collection: collection, remote: !!remote }); }
        catch (e) { console.error('[GGES] listener error', e); }
      }
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

    /* ---------- read ---------- */
    all: function (collection) { return deepClone(readDB()[collection] || []); },

    get: function (collection, id) {
      var list = readDB()[collection] || [];
      for (var i = 0; i < list.length; i++) if (list[i].id === id) return deepClone(list[i]);
      return null;
    },

    find: function (collection, predicate) {
      var list = readDB()[collection] || [];
      for (var i = 0; i < list.length; i++) if (predicate(list[i])) return deepClone(list[i]);
      return null;
    },

    filter: function (collection, predicate) {
      return deepClone((readDB()[collection] || []).filter(predicate));
    },

    settings: function () { return deepClone(readDB().settings || {}); },

    count: function (collection) { return (readDB()[collection] || []).length; },

    /* ---------- write ---------- */
    add: function (collection, item) {
      var db = readDB();
      if (!Array.isArray(db[collection])) db[collection] = [];
      item = Object.assign({}, item);
      if (!item.id) item.id = uid(collection.slice(0, 3));
      if (!item.createdAt) item.createdAt = nowISO();
      item.updatedAt = nowISO();
      db[collection].unshift(item);
      persist(db);
      this.log('Added to ' + collection, item.title || item.name || item.id);
      return item;
    },

    update: function (collection, id, patch) {
      var db = readDB();
      var list = db[collection] || [];
      for (var i = 0; i < list.length; i++) {
        if (list[i].id === id) {
          list[i] = Object.assign({}, list[i], patch, { updatedAt: nowISO() });
          persist(db);
          this.log('Updated ' + collection, patch.title || patch.name || id);
          return list[i];
        }
      }
      return null;
    },

    remove: function (collection, id) {
      var db = readDB();
      var list = db[collection] || [];
      var before = list.length;
      db[collection] = list.filter(function (x) { return x.id !== id; });
      if (db[collection].length !== before) {
        persist(db);
        this.log('Deleted from ' + collection, id);
        return true;
      }
      return false;
    },

    saveSettings: function (patch) {
      var db = readDB();
      db.settings = Object.assign({}, db.settings, patch);
      db.settings.updatedAt = nowISO();
      persist(db);
      return deepClone(db.settings);
    },

    log: function (action, detail, broadcast) {
      var db = readDB();
      db.activity = db.activity || [];
      db.activity.unshift({ id: uid('act'), action: action, detail: detail || '', at: nowISO() });
      db.activity = db.activity.slice(0, 60);
      persist(db, broadcast !== false);
    },

    /* ---------- realtime ---------- */
    subscribe: function (collection, cb) {
      listeners.push({ collection: collection || '*', cb: cb });
      cb(readDB(), { collection: collection, remote: false });
      return function off() {
        listeners = listeners.filter(function (l) { return l.cb !== cb; });
      };
    },

    onActivity: function (cb) { return this.subscribe('activity', cb); },

    /* ---------- session / auth ---------- */
    session: function () {
      try { return JSON.parse(global.localStorage.getItem(SESSION_KEY) || 'null'); }
      catch (e) { return null; }
    },
    isAdmin: function () {
      var s = this.session();
      return !!(s && s.role === 'admin' && s.expires > Date.now());
    },
    login: function (username, password) {
      var db = readDB();
      var auth = (db.settings && db.settings.auth) || { username: 'admin', password: 'gges36' };
      if (String(username).trim().toLowerCase() === String(auth.username).toLowerCase() &&
          String(password) === String(auth.password)) {
        var s = { username: auth.username, role: 'admin', loginAt: nowISO(), expires: Date.now() + 8 * 3600000 };
        global.localStorage.setItem(SESSION_KEY, JSON.stringify(s));
        this.log('Admin login', s.username);
        return true;
      }
      return false;
    },
    logout: function () {
      this.log('Admin logout', '');
      global.localStorage.removeItem(SESSION_KEY);
    },
    defaultCredentials: function () {
      var db = readDB();
      return (db.settings && db.settings.auth) || { username: 'admin', password: 'gges36' };
    },
    changeCredentials: function (username, password) {
      var db = readDB();
      db.settings.auth = { username: String(username).trim(), password: String(password) };
      persist(db);
      return true;
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
    export: function () { return JSON.stringify(readDB(), null, 2); },
    import: function (json) {
      var parsed = typeof json === 'string' ? JSON.parse(json) : json;
      if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.notices)) {
        throw new Error('INVALID_BACKUP');
      }
      cache = parsed;
      persist(parsed);
      return true;
    },
    reset: function () {
      cache = seedDatabase();
      persist(cache);
      return true;
    },

    /* seed extra demo content on demand */
    reseedDemo: function () {
      var seed = seedDatabase();
      var db = readDB();
      db.notices = seed.notices.concat(db.notices || []);
      db.students = db.students && db.students.length ? db.students : seed.students;
      db.teachers = db.teachers && db.teachers.length ? db.teachers : seed.teachers;
      db.results = db.results && db.results.length ? db.results : seed.results;
      db.gallery = (db.gallery || []).concat(seed.gallery);
      persist(db);
      return true;
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
    readFileAsDataURL: function (file, maxKB) {
      return new Promise(function (resolve, reject) {
        var limit = (maxKB || 900) * 1024;
        if (file.size > limit) {
          reject(new Error('FILE_TOO_LARGE'));
          return;
        }
        var fr = new FileReader();
        fr.onload = function () { resolve(fr.result); };
        fr.onerror = function () { reject(fr.error); };
        fr.readAsDataURL(file);
      });
    },
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

  // initialise on load
  readDB();

  /* keep multiple views of the same page in sync when storage is shared */
  global.addEventListener('beforeunload', function () {
    try { if (channel) channel.close(); } catch (e) {}
  });

})(window);
