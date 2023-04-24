import { memo } from "react";
import { useTranslation } from "react-i18next";
import useQuran from "../../context/QuranContext";
import { useQuranBrowser } from "../../pages/QuranBrowser";

import SelectionListChapters from "./SelectionListChapters";
import SelectionListRoots from "./SelectionListRoots";
import { verseProps } from "../../types";
import { SEARCH_METHOD, SEARCH_SCOPE, qbActions } from "./consts";

interface SearchPanelProps {
  radioSearchMethod: string;
  searchDiacritics: boolean;
  searchIdentical: boolean;
  searchAllQuran: boolean;
  searchString: string;
  searchResult: verseProps[];
  selectedChapters: string[];
}

const SearchPanel = memo(
  ({
    radioSearchMethod,
    searchDiacritics,
    searchIdentical,
    searchAllQuran,
    searchString,
    searchResult,
    selectedChapters,
  }: SearchPanelProps) => {
    const { allQuranText, absoluteQuran, chapterNames, quranRoots } =
      useQuran();
    const { t } = useTranslation();
    const dispatchAction = useQuranBrowser();

    const isRootSearch =
      radioSearchMethod === SEARCH_METHOD.ROOT ? true : false;

    function setSearchAllQuran(status: boolean) {
      dispatchAction(
        qbActions.setSearchScope(
          status === true
            ? SEARCH_SCOPE.ALL_CHAPTERS
            : SEARCH_SCOPE.MULTIPLE_CHAPTERS
        )
      );
    }

    function setSearchDiacritics(status: boolean) {
      dispatchAction(qbActions.setSearchDiacritics(status));
    }

    function setSearchIdentical(status: boolean) {
      dispatchAction(qbActions.setSearchIdentical(status));
    }

    function setRadioSearchMethod(method: SEARCH_METHOD) {
      dispatchAction(qbActions.setRadioSearch(method));
    }

    function onSearchSubmit() {
      if (isRootSearch) {
        dispatchAction(
          qbActions.submitRootSearch({
            absoluteQuran,
            chapterNames,
            quranRoots,
          })
        );
      } else {
        dispatchAction(
          qbActions.submitWordSearch({
            allQuranText,
            chapterNames,
          })
        );
      }
    }

    function handleSelectionListChapters(
      selectedOptions: string[],
      selectedChapter: string
    ) {
      if (!selectedChapter) return;

      if (selectedOptions.length === 1) {
        dispatchAction(qbActions.gotoChapter(selectedChapter));
      } else {
        dispatchAction(qbActions.setChapters(selectedOptions));
      }
    }

    return (
      <div className="browser-search">
        <SelectionListChapters
          handleSelectionListChapters={handleSelectionListChapters}
          selectedChapters={selectedChapters}
        />
        <RadioSearchMethod
          radioSearchMethod={radioSearchMethod}
          setRadioSearchMethod={setRadioSearchMethod}
        />
        <CheckboxComponent
          checkboxState={searchDiacritics}
          setCheckBoxState={setSearchDiacritics}
          labelText={t("search_diacritics")}
          isDisabled={isRootSearch}
        />
        <CheckboxComponent
          checkboxState={searchIdentical}
          setCheckBoxState={setSearchIdentical}
          labelText={t("search_identical")}
          isDisabled={isRootSearch}
        />
        <CheckboxComponent
          checkboxState={searchAllQuran}
          setCheckBoxState={setSearchAllQuran}
          labelText={t("search_all_quran")}
        />
        <FormWordSearch
          onSearchSubmit={onSearchSubmit}
          searchString={searchString}
        />
        <SelectionListRoots
          isDisabled={!isRootSearch}
          searchString={searchString}
        />
        <SearchSuccessComponent searchResult={searchResult} />
      </div>
    );
  }
);

SearchPanel.displayName = "SearchPanel";

interface RadioSearchMethodProps {
  radioSearchMethod: string;
  setRadioSearchMethod: (method: SEARCH_METHOD) => void;
}

const RadioSearchMethod = ({
  radioSearchMethod,
  setRadioSearchMethod,
}: RadioSearchMethodProps) => {
  const { t, i18n } = useTranslation();
  const handleSearchMethod = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRadioSearchMethod(event.target.value as SEARCH_METHOD);
  };
  return (
    <div>
      {t("search_method")}
      <div
        className={`form-check form-check-inline ${
          i18n.resolvedLanguage === "ar" && "form-check-reverse"
        }`}
      >
        <input
          className="form-check-input"
          type="radio"
          name="inlineRadioOptions"
          id="inlineRadio1"
          value={SEARCH_METHOD.ROOT}
          checked={radioSearchMethod === SEARCH_METHOD.ROOT}
          onChange={handleSearchMethod}
        />
        <label className="form-check-label" htmlFor="inlineRadio1">
          {t("search_root")}
        </label>
      </div>
      <div
        className={`form-check form-check-inline ${
          i18n.resolvedLanguage === "ar" && "form-check-reverse"
        }`}
      >
        <input
          className="form-check-input"
          type="radio"
          name="inlineRadioOptions"
          id="inlineRadio2"
          value={SEARCH_METHOD.WORD}
          checked={radioSearchMethod === SEARCH_METHOD.WORD}
          onChange={handleSearchMethod}
        />
        <label className="form-check-label" htmlFor="inlineRadio2">
          {t("search_word")}
        </label>
      </div>
    </div>
  );
};

interface FormWordSearchProps {
  onSearchSubmit: () => void;
  searchString: string;
}

const FormWordSearch = ({
  onSearchSubmit,
  searchString,
}: FormWordSearchProps) => {
  const dispatchAction = useQuranBrowser();
  const { t } = useTranslation();

  const searchStringHandle = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatchAction(qbActions.setSearchString(event.target.value));
  };

  function handleSearchSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    onSearchSubmit();
  }

  return (
    <form
      className="container p-0 mt-2"
      role="search"
      onSubmit={handleSearchSubmit}
    >
      <div className="row">
        <div className="col">
          <input
            className="form-control"
            type="search"
            placeholder=""
            value={searchString}
            aria-label="Search"
            onChange={searchStringHandle}
            required
            dir="rtl"
          />
        </div>
        <div className="col">
          <button className="btn btn-outline-success" type="submit">
            {t("search_button")}
          </button>
        </div>
      </div>
    </form>
  );
};

interface CheckBoxProps {
  checkboxState: boolean;
  setCheckBoxState: (status: boolean) => void;
  labelText: string;
  isDisabled?: boolean;
}

const CheckboxComponent = ({
  checkboxState,
  setCheckBoxState,
  labelText,
  isDisabled = false,
}: CheckBoxProps) => {
  const { i18n } = useTranslation();

  const handleChangeCheckboxState = () => {
    setCheckBoxState(!checkboxState);
  };
  return (
    <div
      className={`form-check mt-2  ${
        i18n.resolvedLanguage === "ar" && "form-check-reverse"
      }`}
    >
      <input
        className="form-check-input"
        type="checkbox"
        checked={checkboxState}
        onChange={handleChangeCheckboxState}
        value=""
        id="flexCheckDefault"
        disabled={isDisabled}
      />
      <label className="form-check-label" htmlFor="flexCheckDefault">
        {labelText}
      </label>
    </div>
  );
};

interface SearchSuccessComponentProps {
  searchResult: verseProps[];
}

const SearchSuccessComponent = ({
  searchResult,
}: SearchSuccessComponentProps) => {
  const { t } = useTranslation();
  return (
    <>
      {searchResult.length > 0 && (
        <p className="mt-3 text-success">
          {t("search_count") + " " + searchResult.length}{" "}
        </p>
      )}
    </>
  );
};

export default SearchPanel;
