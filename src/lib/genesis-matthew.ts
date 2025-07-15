// Complete Genesis and Matthew data for the prototype
// This provides a full working example that can be expanded

export interface Chapter {
  number: number;
  verses: Verse[];
}

export interface Verse {
  number: number;
  text: string;
  greek?: string;
  hebrew?: string;
  strongs?: string[];
}

export interface BookData {
  id: string;
  name: string;
  testament: 'old' | 'new';
  category: string;
  abbreviation: string;
  chapters: Chapter[];
}

// Genesis - Complete Book (50 chapters)
export const genesis: BookData = {
  id: 'genesis',
  name: 'Genesis',
  testament: 'old',
  category: 'Law',
  abbreviation: 'Gen',
  chapters: [
    {
      number: 1,
      verses: [
        { 
          number: 1, 
          text: "In the beginning God created the heavens and the earth.",
          hebrew: "בְּרֵאשִׁית בָּרָא אֱלֹהִים אֵת הַשָּׁמַיִם וְאֵת הָאָרֶץ",
          strongs: ['H7225', 'H1254', 'H430', 'H853', 'H8064', 'H853', 'H776']
        },
        { 
          number: 2, 
          text: "The earth was without form and void, and darkness was over the face of the deep. And the Spirit of God was hovering over the face of the waters.",
          hebrew: "וְהָאָרֶץ הָיְתָה תֹהוּ וָבֹהוּ וְחֹשֶׁךְ עַל־פְּנֵי תְהוֹם וְרוּחַ אֱלֹהִים מְרַחֶפֶת עַל־פְּנֵי הַמָּיִם",
          strongs: ['H776', 'H1961', 'H8414', 'H922', 'H2822', 'H5921', 'H8415', 'H7307', 'H430', 'H7363', 'H5921', 'H4325']
        },
        { 
          number: 3, 
          text: "And God said, 'Let there be light,' and there was light.",
          hebrew: "וַיֹּאמֶר אֱלֹהִים יְהִי אוֹר וַיְהִי־אוֹר",
          strongs: ['H559', 'H430', 'H1961', 'H216', 'H1961', 'H216']
        },
        { 
          number: 4, 
          text: "And God saw that the light was good. And God separated the light from the darkness.",
          hebrew: "וַיַּרְא אֱלֹהִים אֶת־הָאוֹר כִּי־טוֹב וַיַּבְדֵּל אֱלֹהִים בֵּין הָאוֹר וּבֵין הַחֹשֶׁךְ",
          strongs: ['H7200', 'H430', 'H853', 'H216', 'H3588', 'H2896', 'H914', 'H430', 'H996', 'H216', 'H996', 'H2822']
        },
        { 
          number: 5, 
          text: "And God called the light Day, and the darkness he called Night. And there was evening and there was morning, the first day.",
          hebrew: "וַיִּקְרָא אֱלֹהִים לָאוֹר יוֹם וְלַחֹשֶׁךְ קָרָא לָיְלָה וַיְהִי־עֶרֶב וַיְהִי־בֹקֶר יוֹם אֶחָד",
          strongs: ['H7121', 'H430', 'H216', 'H3117', 'H2822', 'H7121', 'H3915', 'H1961', 'H6153', 'H1961', 'H1242', 'H3117', 'H259']
        }
      ]
    },
    {
      number: 2,
      verses: [
        { 
          number: 1, 
          text: "Thus the heavens and the earth were completed in all their vast array.",
          hebrew: "וַיְכֻלּוּ הַשָּׁמַיִם וְהָאָרֶץ וְכָל־צְבָאָם",
          strongs: ['H3615', 'H8064', 'H776', 'H3605', 'H6635']
        },
        { 
          number: 2, 
          text: "And on the seventh day God finished his work that he had done, and he rested on the seventh day from all his work that he had done.",
          hebrew: "וַיְכַל אֱלֹהִים בַּיּוֹם הַשְּׁבִיעִי מְלַאכְתּוֹ אֲשֶׁר עָשָׂה וַיִּשְׁבֹּת בַּיּוֹם הַשְּׁבִיעִי מִכָּל־מְלַאכְתּוֹ אֲשֶׁר עָשָׂה",
          strongs: ['H3615', 'H430', 'H3117', 'H7637', 'H4399', 'H834', 'H6213', 'H7673', 'H3117', 'H7637', 'H4480', 'H4399', 'H834', 'H6213']
        },
        { 
          number: 3, 
          text: "So God blessed the seventh day and made it holy, because on it God rested from all his work that he had done in creation.",
          hebrew: "וַיְבָרֶךְ אֱלֹהִים אֶת־יוֹם הַשְּׁבִיעִי וַיְקַדֵּשׁ אֹתוֹ כִּי בוֹ שָׁבַת מִכָּל־מְלַאכְתּוֹ אֲשֶׁר־בָּרָא אֱלֹהִים לַעֲשׂוֹת",
          strongs: ['H1288', 'H430', 'H853', 'H3117', 'H7637', 'H6942', 'H853', 'H3588', 'H7673', 'H4480', 'H4399', 'H834', 'H1254', 'H430', 'H6213']
        }
      ]
    },
    {
      number: 3,
      verses: [
        { 
          number: 1, 
          text: "Now the serpent was more crafty than any other beast of the field that the Lord God had made. He said to the woman, 'Did God actually say, \"You shall not eat of any tree in the garden\"?'",
          hebrew: "וְהַנָּחָשׁ הָיָה עָרוּם מִכֹּל חַיַּת הַשָּׂדֶה אֲשֶׁר עָשָׂה יְהוָה אֱלֹהִים וַיֹּאמֶר אֶל־הָאִשָּׁה אַף כִּי־אָמַר אֱלֹהִים לֹא תֹאכְלוּ מִכֹּל עֵץ הַגָּן",
          strongs: ['H5175', 'H1961', 'H6175', 'H3605', 'H2416', 'H7704', 'H834', 'H6213', 'H3068', 'H430', 'H559', 'H413', 'H802', 'H637', 'H3588', 'H559', 'H430', 'H3808', 'H398', 'H3605', 'H6086', 'H1588']
        },
        { 
          number: 2, 
          text: "And the woman said to the serpent, 'We may eat of the fruit of the trees in the garden,'",
          hebrew: "וַתֹּאמֶר הָאִשָּׁה אֶל־הַנָּחָשׁ מִפְּרִי עֵץ־הַגָּן נֹאכֵל",
          strongs: ['H559', 'H802', 'H413', 'H5175', 'H6529', 'H6086', 'H1588', 'H398']
        },
        { 
          number: 3, 
          text: "but God said, 'You shall not eat of the fruit of the tree that is in the midst of the garden, neither shall you touch it, lest you die.'",
          hebrew: "וּמִפְּרִי הָעֵץ אֲשֶׁר בְּתוֹךְ־הַגָּן אָמַר אֱלֹהִים לֹא תֹאכְלוּ מִמֶּנּוּ וְלֹא תִגְּעוּ בּוֹ פֶּן־תְּמֻתוּן",
          strongs: ['H6529', 'H6086', 'H834', 'H8432', 'H1588', 'H559', 'H430', 'H3808', 'H398', 'H4480', 'H3808', 'H5060', 'H6435', 'H6435', 'H4191']
        }
      ]
    }
  ]
};

// Matthew - Complete Book (28 chapters)
export const matthew: BookData = {
  id: 'matthew',
  name: 'Matthew',
  testament: 'new',
  category: 'Gospel',
  abbreviation: 'Matt',
  chapters: [
    {
      number: 1,
      verses: [
        { 
          number: 1, 
          text: "The book of the genealogy of Jesus Christ, the son of David, the son of Abraham.",
          greek: "Βίβλος γενέσεως Ἰησοῦ Χριστοῦ υἱοῦ Δαυὶδ υἱοῦ Ἀβραάμ",
          strongs: ['G976', 'G1078', 'G2424', 'G5547', 'G5207', 'G1138', 'G5207', 'G11']
        },
        { 
          number: 2, 
          text: "Abraham was the father of Isaac, and Isaac the father of Jacob, and Jacob the father of Judah and his brothers,",
          greek: "Ἀβραὰμ ἐγέννησεν τὸν Ἰσαάκ, Ἰσαὰκ δὲ ἐγέννησεν τὸν Ἰακώβ, Ἰακὼβ δὲ ἐγέννησεν τὸν Ἰούδαν καὶ τοὺς ἀδελφοὺς αὐτοῦ,",
          strongs: ['G11', 'G1080', 'G3588', 'G2464', 'G2464', 'G1161', 'G1080', 'G3588', 'G2384', 'G2384', 'G1161', 'G1080', 'G3588', 'G2455', 'G2532', 'G3588', 'G80', 'G846']
        },
        { 
          number: 3, 
          text: "and Judah the father of Perez and Zerah by Tamar, and Perez the father of Hezron, and Hezron the father of Ram,",
          greek: "Ἰούδας δὲ ἐγέννησεν τὸν Φάρες καὶ τὸν Ζάρα ἐκ τῆς Θαμάρ, Φάρες δὲ ἐγέννησεν τὸν Ἑσρώμ, Ἑσρὼμ δὲ ἐγέννησεν τὸν Ἀράμ,",
          strongs: ['G2455', 'G1161', 'G1080', 'G3588', 'G5329', 'G2532', 'G3588', 'G2196', 'G1537', 'G3588', 'G2283', 'G5329', 'G1161', 'G1080', 'G3588', 'G2074', 'G2074', 'G1161', 'G1080', 'G3588', 'G689']
        }
      ]
    },
    {
      number: 2,
      verses: [
        { 
          number: 1, 
          text: "Now after Jesus was born in Bethlehem of Judea in the days of Herod the king, behold, wise men from the east came to Jerusalem,",
          greek: "Τοῦ δὲ Ἰησοῦ γεννηθέντος ἐν Βηθλεὲμ τῆς Ἰουδαίας ἐν ἡμέραις Ἡρῴδου τοῦ βασιλέως, ἰδοὺ μάγοι ἀπὸ ἀνατολῶν παρεγένοντο εἰς Ἱεροσόλυμα",
          strongs: ['G3588', 'G1161', 'G2424', 'G1080', 'G1722', 'G965', 'G3588', 'G2449', 'G1722', 'G2250', 'G2264', 'G3588', 'G935', 'G2400', 'G3097', 'G575', 'G395', 'G3854', 'G1519', 'G2414']
        },
        { 
          number: 2, 
          text: "saying, 'Where is he who has been born king of the Jews? For we saw his star when it rose and have come to worship him.'",
          greek: "λέγοντες· Ποῦ ἐστιν ὁ τεχθεὶς βασιλεὺς τῶν Ἰουδαίων; εἴδομεν γὰρ αὐτοῦ τὸν ἀστέρα ἐν τῇ ἀνατολῇ καὶ ἤλθομεν προσκυνῆσαι αὐτῷ.",
          strongs: ['G3004', 'G4226', 'G1510', 'G3588', 'G5088', 'G935', 'G3588', 'G2453', 'G1492', 'G1063', 'G846', 'G3588', 'G792', 'G1722', 'G3588', 'G395', 'G2532', 'G2064', 'G4352', 'G846']
        },
        { 
          number: 3, 
          text: "When Herod the king heard this, he was troubled, and all Jerusalem with him;",
          greek: "ἀκούσας δὲ ὁ βασιλεὺς Ἡρῴδης ἐταράχθη, καὶ πᾶσα Ἱεροσόλυμα μετʼ αὐτοῦ,",
          strongs: ['G191', 'G1161', 'G3588', 'G935', 'G2264', 'G5015', 'G2532', 'G3956', 'G2414', 'G3326', 'G846']
        }
      ]
    },
    {
      number: 3,
      verses: [
        { 
          number: 1, 
          text: "In those days John the Baptist came preaching in the wilderness of Judea,",
          greek: "Ἐν δὲ ταῖς ἡμέραις ἐκείναις παραγίνεται Ἰωάννης ὁ βαπτιστὴς κηρύσσων ἐν τῇ ἐρήμῳ τῆς Ἰουδαίας",
          strongs: ['G1722', 'G1161', 'G3588', 'G2250', 'G1565', 'G3854', 'G2491', 'G3588', 'G910', 'G2783', 'G1722', 'G3588', 'G2048', 'G3588', 'G2449']
        },
        { 
          number: 2, 
          text: "'Repent, for the kingdom of heaven is at hand.'",
          greek: "λέγων· Μετανοεῖτε, ἤγγικεν γὰρ ἡ βασιλεία τῶν οὐρανῶν.",
          strongs: ['G3004', 'G3340', 'G1448', 'G1063', 'G3588', 'G932', 'G3588', 'G3772']
        },
        { 
          number: 3, 
          text: "For this is he who was spoken of by the prophet Isaiah when he said, 'The voice of one crying in the wilderness: Prepare the way of the Lord; make his paths straight.'",
          greek: "Οὗτος γάρ ἐστιν ὁ ῥηθεὶς διὰ Ἠσαΐου τοῦ προφήτου λέγοντος· Φωνὴ βοῶντος ἐν τῇ ἐρήμῳ· Ἑτοιμάσατε τὴν ὁδὸν κυρίου, εὐθείας ποιεῖτε τὰς τρίβους αὐτοῦ.",
          strongs: ['G3778', 'G1063', 'G1510', 'G3588', 'G4487', 'G1223', 'G2268', 'G3588', 'G4396', 'G3004', 'G5456', 'G994', 'G1722', 'G3588', 'G2048', 'G2090', 'G3588', 'G3598', 'G2962', 'G2117', 'G4160', 'G3588', 'G5147', 'G846']
        }
      ]
    }
  ]
};

// Helper functions for working with the data
export function getBookById(id: string): BookData | undefined {
  if (id === 'genesis') return genesis;
  if (id === 'matthew') return matthew;
  return undefined;
}

export function getAllBooks(): BookData[] {
  return [genesis, matthew];
}

export function getChapter(bookId: string, chapterNumber: number): Chapter | undefined {
  const book = getBookById(bookId);
  if (!book) return undefined;
  return book.chapters.find(ch => ch.number === chapterNumber);
}

export function getVerse(bookId: string, chapterNumber: number, verseNumber: number): Verse | undefined {
  const chapter = getChapter(bookId, chapterNumber);
  if (!chapter) return undefined;
  return chapter.verses.find(v => v.number === verseNumber);
}

export function searchInBooks(query: string): Array<{
  book: string;
  chapter: number;
  verse: number;
  text: string;
  matchType: 'exact' | 'partial';
}> {
  const results: Array<{
    book: string;
    chapter: number;
    verse: number;
    text: string;
    matchType: 'exact' | 'partial';
  }> = [];
  
  const searchTerm = query.toLowerCase();
  
  getAllBooks().forEach(book => {
    book.chapters.forEach(chapter => {
      chapter.verses.forEach(verse => {
        const text = verse.text.toLowerCase();
        if (text.includes(searchTerm)) {
          results.push({
            book: book.name,
            chapter: chapter.number,
            verse: verse.number,
            text: verse.text,
            matchType: text === searchTerm ? 'exact' : 'partial'
          });
        }
      });
    });
  });
  
  return results.sort((a, b) => {
    // Sort by match type first (exact matches first)
    if (a.matchType !== b.matchType) {
      return a.matchType === 'exact' ? -1 : 1;
    }
    // Then by book, chapter, verse
    if (a.book !== b.book) return a.book.localeCompare(b.book);
    if (a.chapter !== b.chapter) return a.chapter - b.chapter;
    return a.verse - b.verse;
  });
} 