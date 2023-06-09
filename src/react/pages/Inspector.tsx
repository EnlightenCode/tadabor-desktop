import {
  Dispatch,
  Fragment,
  memo,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import useQuran from "../context/QuranContext";
import { ActionsUnion, createActionPayload, rootProps } from "../types";
import { Collapse, Tooltip } from "bootstrap";
import NoteText from "../components/NoteText";
import { IconSelect } from "@tabler/icons-react";
import { splitByArray } from "../util/util";
import { searchIndexProps } from "../components/QuranBrowser/consts";

interface RankedVerseProps {
  key: string;
  suraid: string;
  verseid: string;
  versetext: string;
  rank: number;
}

interface versePartProps {
  text: string;
  highlight: boolean;
}

interface rootVerseProps {
  verseParts: versePartProps[];
  key: string;
  suraid: string;
  verseid: string;
}

interface stateProps {
  currentChapter: number;
  scrollKey: string;
}

enum IS_ACTIONS {
  SET_CHAPTER = "dispatchSetChapter",
  SET_SCROLL_KEY = "dispatchSetScrollKey",
  GOTO_CHAPTER = "dispatchGotoChapter",
}

const isActions = {
  setChapter: createActionPayload<IS_ACTIONS.SET_CHAPTER, number>(
    IS_ACTIONS.SET_CHAPTER
  ),
  setScrollKey: createActionPayload<IS_ACTIONS.SET_SCROLL_KEY, string>(
    IS_ACTIONS.SET_SCROLL_KEY
  ),
  gotoChapter: createActionPayload<IS_ACTIONS.GOTO_CHAPTER, number>(
    IS_ACTIONS.GOTO_CHAPTER
  ),
};

type clActionsProps = ActionsUnion<typeof isActions>;

function reducer(state: stateProps, action: clActionsProps): stateProps {
  switch (action.type) {
    case IS_ACTIONS.SET_CHAPTER: {
      return { ...state, currentChapter: action.payload };
    }
    case IS_ACTIONS.SET_SCROLL_KEY: {
      return { ...state, scrollKey: action.payload };
    }
    case IS_ACTIONS.GOTO_CHAPTER: {
      return { ...state, scrollKey: "", currentChapter: action.payload };
    }
  }
}

function Inspector() {
  const initialState: stateProps = {
    currentChapter: 1,
    scrollKey: "",
  };

  const [state, dispatchIsAction] = useReducer(reducer, initialState);

  function handleSelectChapter(chapterID: string) {
    dispatchIsAction(isActions.setChapter(Number(chapterID)));
  }

  return (
    <div className="inspector">
      <ChaptersList
        selectedChapter={state.currentChapter}
        handleSelectChapter={handleSelectChapter}
      />
      <Display
        currentChapter={state.currentChapter}
        dispatchIsAction={dispatchIsAction}
        scrollKey={state.scrollKey}
      />
    </div>
  );
}

interface ChaptersListProps {
  selectedChapter: number;
  handleSelectChapter: (chapterID: string) => void;
}

const ChaptersList = ({
  selectedChapter,
  handleSelectChapter,
}: ChaptersListProps) => {
  const { chapterNames } = useQuran();
  const [chapterSearch, setChapterSearch] = useState("");

  const onChangeInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChapterSearch(event.target.value);
  };

  function onChangeSelect(event: React.ChangeEvent<HTMLSelectElement>) {
    handleSelectChapter(event.target.value);
  }

  return (
    <div className="side">
      <div className="side-chapters">
        <input
          className="form-control side-chapters-input"
          type="search"
          value={chapterSearch}
          onChange={onChangeInput}
          placeholder=""
          aria-label="Search"
          dir="rtl"
        />
        <select
          className="form-select side-chapters-list"
          size={7}
          onChange={onChangeSelect}
          aria-label="size 7 select example"
          value={selectedChapter}
        >
          {chapterNames
            .filter((chapter) => chapter.name.includes(chapterSearch))
            .map((chapter) => (
              <option key={chapter.id} value={chapter.id}>
                {chapter.id}. {chapter.name}
              </option>
            ))}
        </select>
      </div>
    </div>
  );
};

interface DisplayProps {
  currentChapter: number;
  scrollKey: string;
  dispatchIsAction: Dispatch<clActionsProps>;
}

const Display = ({
  currentChapter,
  scrollKey,
  dispatchIsAction,
}: DisplayProps) => {
  const { chapterNames, absoluteQuran } = useQuran();
  const refDisplay = useRef<HTMLDivElement>(null);

  const chapterVerses: RankedVerseProps[] = [];

  absoluteQuran.forEach((verse, index) => {
    if (verse.suraid !== currentChapter.toString()) return;

    chapterVerses.push({ ...verse, rank: index });
  });

  // Reset scroll whenever we switch from one chapter to another
  useEffect(() => {
    if (!refDisplay.current) return;

    refDisplay.current.scrollTop = 0;
  }, [currentChapter]);

  return (
    <div className="p-2 display" ref={refDisplay}>
      <div className="card p-2 display-verses">
        <div className="card-header text-primary text-center fs-4">
          سورة {chapterNames[currentChapter - 1].name}
        </div>
        <ListVerses
          chapterVerses={chapterVerses}
          scrollKey={scrollKey}
          dispatchIsAction={dispatchIsAction}
        />
      </div>
    </div>
  );
};

interface ListVersesProps {
  chapterVerses: RankedVerseProps[];
  scrollKey: string;
  dispatchIsAction: Dispatch<clActionsProps>;
}

const ListVerses = ({
  chapterVerses,
  scrollKey,
  dispatchIsAction,
}: ListVersesProps) => {
  const refList = useRef<HTMLDivElement>(null);
  // Reset scroll whenever we switch from one chapter to another
  useEffect(() => {
    if (!refList.current) return;

    if (!scrollKey) return;

    const verseToHighlight = refList.current.querySelector(
      `[data-id="${scrollKey}"]`
    );

    if (verseToHighlight) {
      setTimeout(() => {
        verseToHighlight.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      });
    }
  }, [scrollKey, dispatchIsAction]);

  return (
    <div ref={refList} className="card-body" dir="rtl">
      {chapterVerses.map((verse) => (
        <div
          className={`display-verses-item ${
            scrollKey === verse.key ? "display-verses-item-selected" : ""
          }`}
          key={verse.key}
          data-id={verse.key}
        >
          <VerseWords
            verseRank={verse.rank}
            verseText={verse.versetext.split(" ")}
            verseID={verse.verseid}
            verseKey={verse.key}
            dispatchIsAction={dispatchIsAction}
          />
        </div>
      ))}
    </div>
  );
};

interface VerseWordsProps {
  verseRank: number;
  verseText: string[];
  verseID: string;
  verseKey: string;
  dispatchIsAction: Dispatch<clActionsProps>;
}

const VerseWords = ({
  verseText,
  verseRank,
  verseID,
  verseKey,
  dispatchIsAction,
}: VerseWordsProps) => {
  const { quranRoots } = useQuran();
  const [currentRoots, setCurrentRoots] = useState<rootProps[]>([]);
  const [selectedWord, setSelectedWord] = useState(-1);
  const refCollapsible = useRef<HTMLDivElement>(null);
  const refCollapse = useRef<Collapse>();
  const refCurrentWord = useRef<number>();

  useEffect(() => {
    if (refCollapsible.current) {
      refCollapse.current = new Collapse(refCollapsible.current, {
        toggle: false,
      });
    }
  }, []);

  function onClickWord(index: number) {
    const wordRoots = quranRoots.filter((root) =>
      root.occurences.find((occ) => {
        const rootData = occ.split(":");

        if (rootData[0] !== verseRank.toString()) return false;

        const wordIndexes = rootData[1].split(",");

        return wordIndexes.includes(index.toString());
      })
    );

    setCurrentRoots(wordRoots.sort((a, b) => b.name.length - a.name.length));

    if (selectedWord === index - 1) {
      setSelectedWord(-1);
    } else {
      setSelectedWord(index - 1);
    }

    if (refCollapse.current) {
      if (refCurrentWord.current === index) {
        refCollapse.current.hide();
        refCurrentWord.current = -1;
      } else {
        refCollapse.current.show();
        refCurrentWord.current = index;
      }
    }
  }

  return (
    <>
      <div className="display-verses-item-text">
        {verseText.map((word, index) => (
          <Fragment key={index}>
            <span
              onClick={() => onClickWord(index + 1)}
              className={`display-verses-item-text-word ${
                selectedWord === index
                  ? "display-verses-item-text-word-selected"
                  : ""
              }`}
            >
              {word}
            </span>{" "}
          </Fragment>
        ))}{" "}
        {`(${verseID})`}{" "}
        <button
          className="btn"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target={`#collapseExample${verseKey}`}
          aria-expanded="false"
          aria-controls={`collapseExample${verseKey}`}
        >
          <IconSelect />
        </button>
      </div>
      <NoteText verseKey={verseKey} />
      <div
        ref={refCollapsible}
        className="collapse"
        id={`collapseExample${verseRank}`}
      >
        <div className="card card-body">
          <div
            className="accordion display-verses-item-roots"
            id="accordionPanelsStayOpenExample"
          >
            {currentRoots.map((root) => (
              <div className="accordion-item" key={root.id}>
                <h2 className="accordion-header">
                  <button
                    className="accordion-button collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target={`#panelsStayOpen-${root.id}`}
                    aria-expanded="false"
                    aria-controls={`panelsStayOpen-${root.id}`}
                  >
                    {root.name}
                  </button>
                </h2>
                <RootOccurences
                  rootID={root.id}
                  rootOccs={root.occurences}
                  dispatchIsAction={dispatchIsAction}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

interface RootOccurencesProps {
  rootID: number;
  rootOccs: string[];
  dispatchIsAction: Dispatch<clActionsProps>;
}

const RootOccurences = ({
  rootID,
  rootOccs,
  dispatchIsAction,
}: RootOccurencesProps) => {
  const [isShown, setIsShown] = useState(false);
  const [itemsCount, setItemsCount] = useState(20);
  const refCollapse = useRef<HTMLDivElement>(null);
  const [scrollKey, setScrollKey] = useState("");

  useEffect(() => {
    const collapseElement = refCollapse.current;
    function onShowRoots(event: Event) {
      setIsShown(true);
    }

    function onHiddenRoots(event: Event) {
      setIsShown(false);
    }

    if (collapseElement !== null) {
      collapseElement.addEventListener("show.bs.collapse", onShowRoots);
      collapseElement.addEventListener("hidden.bs.collapse", onHiddenRoots);
    }

    return () => {
      if (collapseElement !== null) {
        collapseElement.removeEventListener("show.bs.collapse", onShowRoots);
        collapseElement.removeEventListener(
          "hidden.bs.collapse",
          onHiddenRoots
        );
      }
    };
  }, []);

  function onScrollOccs(event: React.UIEvent<HTMLDivElement>) {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    // Reached the bottom, ( the +10 is needed since the scrollHeight - scrollTop doesn't seem to go to the very bottom for some reason )
    if (scrollHeight - scrollTop <= clientHeight + 10) {
      setItemsCount((state) => state + 10);
    }
  }

  const { chapterNames, absoluteQuran } = useQuran();

  const derivations: searchIndexProps[] = [];

  const rootVerses: rootVerseProps[] = [];

  rootOccs.forEach((occ) => {
    const occData = occ.split(":");
    const verse = absoluteQuran[Number(occData[0])];
    const wordIndexes = occData[1].split(",");
    const verseWords = verse.versetext.split(" ");
    const derivationsArray = wordIndexes.map(
      (index) => verseWords[Number(index) - 1]
    );
    const chapterName = chapterNames[Number(verse.suraid) - 1].name;
    const verseDerivations = derivationsArray.map((name, index) => ({
      name,
      key: verse.key,
      text: `${chapterName}:${verse.verseid}`,
      wordIndex: wordIndexes[index],
    }));

    derivations.push(...verseDerivations);

    const rootParts = splitByArray(verse.versetext, derivationsArray);

    const verseParts = rootParts.filter(Boolean).map((part) => ({
      text: part,
      highlight: derivationsArray.includes(part),
    }));

    rootVerses.push({
      verseParts,
      key: verse.key,
      suraid: verse.suraid,
      verseid: verse.verseid,
    });
  });

  const slicedItems = rootVerses.slice(0, itemsCount);

  function handleDerivationClick(verseKey: string, verseIndex: number) {
    if (itemsCount < verseIndex + 20) {
      setItemsCount(verseIndex + 20);
    }
    setScrollKey(verseKey);
  }

  useEffect(() => {
    if (!scrollKey) return;

    if (!refCollapse.current) return;

    const verseToHighlight = refCollapse.current.querySelector(
      `[data-child-id="${scrollKey}"]`
    );

    if (!verseToHighlight) return;

    verseToHighlight.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [scrollKey]);

  return (
    <div
      ref={refCollapse}
      id={`panelsStayOpen-${rootID}`}
      className="accordion-collapse collapse"
    >
      {isShown && (
        <div
          className="accordion-body p-0 display-verses-item-roots-verses"
          onScroll={onScrollOccs}
        >
          <DerivationsComponent
            searchIndexes={derivations}
            handleDerivationClick={handleDerivationClick}
          />
          <div className="p-3">
            {slicedItems.map((rootVerse) => (
              <div
                key={rootVerse.key}
                className={`display-verses-item-roots-verses-item ${
                  scrollKey === rootVerse.key
                    ? "display-verses-item-roots-verses-item-selected"
                    : ""
                }`}
              >
                <RootVerse
                  rootVerse={rootVerse}
                  dispatchIsAction={dispatchIsAction}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

interface DerivationsComponentProps {
  handleDerivationClick: (verseKey: string, verseIndex: number) => void;
  searchIndexes: searchIndexProps[];
}

const DerivationsComponent = memo(
  ({ searchIndexes, handleDerivationClick }: DerivationsComponentProps) => {
    const refListRoots = useRef<HTMLSpanElement>(null);
    useEffect(() => {
      if (!refListRoots.current) return;

      //init tooltip
      const tooltipArray = Array.from(
        refListRoots.current.querySelectorAll('[data-bs-toggle="tooltip"]')
      ).map((tooltipNode) => new Tooltip(tooltipNode));

      return () => {
        tooltipArray.forEach((tooltip) => tooltip.dispose());
      };
    }, [searchIndexes]);

    return (
      <div className="p-2">
        <span ref={refListRoots} className="">
          {searchIndexes.map((root: searchIndexProps, index: number) => (
            <span
              role="button"
              key={index}
              onClick={(e) => handleDerivationClick(root.key, index)}
              data-bs-toggle="tooltip"
              data-bs-title={root.text}
            >
              {`${index ? " -" : " "} ${root.name}`}
            </span>
          ))}
        </span>
        <hr />
      </div>
    );
  }
);

DerivationsComponent.displayName = "DerivationsComponent";

interface RootVerseProps {
  rootVerse: rootVerseProps;
  dispatchIsAction: Dispatch<clActionsProps>;
}

const RootVerse = ({ rootVerse, dispatchIsAction }: RootVerseProps) => {
  const { chapterNames } = useQuran();

  const verseChapter = chapterNames[Number(rootVerse.suraid) - 1].name;

  function onClickVerseChapter() {
    dispatchIsAction(isActions.gotoChapter(Number(rootVerse.suraid)));
    dispatchIsAction(isActions.setScrollKey(rootVerse.key));
  }

  return (
    <>
      <div data-child-id={rootVerse.key}>
        <span className="display-verses-item-roots-verses-item-text">
          {rootVerse.verseParts.map((part, i) => (
            <Fragment key={i}>
              {part.highlight ? <mark>{part.text}</mark> : part.text}
            </Fragment>
          ))}{" "}
          <span
            onClick={onClickVerseChapter}
            className="display-verses-item-roots-verses-item-text-chapter"
          >{`(${verseChapter}:${rootVerse.verseid})`}</span>{" "}
        </span>
        <button
          className="btn"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target={`#collapseExample${rootVerse.key}child`}
          aria-expanded="false"
          aria-controls={`collapseExample${rootVerse.key}child`}
        >
          <IconSelect />
        </button>
      </div>
      <NoteText verseKey={rootVerse.key} targetID={`${rootVerse.key}child`} />
    </>
  );
};

export default Inspector;
