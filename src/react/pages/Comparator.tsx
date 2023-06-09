import { useState } from "react";
import { RankedVerseProps, translationsProps } from "../types";
import useQuran from "../context/QuranContext";
import Display from "../components/Comparator/Display";
import Menu from "../components/Comparator/Menu";

import transMuhammadAsad from "../../data/trans/Muhammad Asad.json";
import transTheMonotheistGroup from "../../data/trans/The Monotheist Group.json";

/*
const transList: transListProps = {
  "Muhammad Asad": { url: "/trans/Muhammad Asad.json" },
  "The Monotheist Group": { url: "/trans/The Monotheist Group.json" },
};
*/

function Comparator() {
  const { absoluteQuran } = useQuran();
  const [currentChapter, setCurrentChapter] = useState("1");
  const [currentVerse, setCurrentVerse] = useState("");

  const translations: translationsProps = {
    "Muhammad Asad": transMuhammadAsad,
    "The Monotheist Group": transTheMonotheistGroup,
  };

  const setChapter = (chapterID: string) => {
    setCurrentChapter(chapterID);
  };

  const selectVerse = (verseKey: string) => {
    setCurrentVerse(verseKey);
  };

  const chapterVerses: RankedVerseProps[] = [];

  absoluteQuran.forEach((verse, index) => {
    if (verse.suraid !== currentChapter) return;

    chapterVerses.push({ ...verse, rank: index });
  });

  return (
    <div className="comparator">
      <Menu
        chapterVerses={chapterVerses}
        handleSelectVerse={selectVerse}
        handleSetChapter={setChapter}
      />
      <Display
        currentChapter={currentChapter}
        currentVerse={currentVerse}
        chapterVerses={chapterVerses}
        transVerses={translations}
        handleSelectVerse={selectVerse}
      />
    </div>
  );
}

export default Comparator;
