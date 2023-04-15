/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { useRef, memo, useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import './StickerBoard.scss';

import initMatrix from '../../../client/initMatrix';
import { getRelevantPacks } from '../emoji-board/custom-emoji';
import AsyncSearch from '../../../util/AsyncSearch';
import { getFrequentStickers, addToStickerHistory } from './frequent';

import Text from '../../atoms/text/Text';
import ScrollView from '../../atoms/scroll/ScrollView';
import RawIcon from '../../atoms/system-icons/RawIcon';
import Input from '../../atoms/input/Input';
import IconButton from '../../atoms/button/IconButton';

import SearchIC from '../../../../public/res/ic/outlined/search.svg';
import RecentClockIC from '../../../../public/res/ic/outlined/recent-clock.svg';

const asyncSearch = new AsyncSearch();

function setupSearch(packs) {
  const customStickers = packs.flatMap((pack) => pack.getStickers());
  asyncSearch.setup(customStickers, { keys: ['shortcode', 'body'], isContain: true, limit: 40 });
}

const StickerGroup = memo(({ stickers, name }) => {
  const mx = initMatrix.matrixClient;
  return (
    <div className="sticker-board__group">
      <Text className="sticker-board__group-header" variant="b2" weight="bold">
        {name ?? 'Unknown'}
      </Text>
      {stickers.length > 0 && (
        <div className="sticker-board__group-items">
          {stickers.map((sticker) => (
            <img
              key={sticker.shortcode}
              className="sticker-board__sticker"
              src={mx.mxcUrlToHttp(sticker.mxc)}
              alt={sticker.shortcode}
              title={sticker.body ?? sticker.shortcode}
              data-mx-sticker={sticker.mxc}
              loading="lazy"
            />
          ))}
        </div>
      )}
    </div>
  );
});

StickerGroup.propTypes = {
  stickers: PropTypes.arrayOf(
    PropTypes.shape({
      shortcode: PropTypes.string,
      mxc: PropTypes.string,
      body: PropTypes.string,
    })
  ).isRequired,
  name: PropTypes.string.isRequired,
};

function SearchedStickers() {
  const [searched, setSearched] = useState(null);

  const handleSearch = useCallback((resultStickers, term) => {
    if (term === '' || resultStickers.length === 0) {
      if (term === '') setSearched(null);
      else setSearched({ stickers: [] });
      return;
    }
    setSearched({ stickers: resultStickers });
  }, []);

  useEffect(() => {
    asyncSearch.on(asyncSearch.RESULT_SENT, handleSearch);
    return () => {
      asyncSearch.removeListener(asyncSearch.RESULT_SENT, handleSearch);
    };
  }, [handleSearch]);

  if (searched === null) return null;

  return (
    <StickerGroup
      stickers={searched.stickers}
      name={searched.stickers.length === 0 ? 'No search result found' : 'Search results'}
    />
  );
}

function isTargetNotSticker(target) {
  return target.classList.contains('sticker-board__sticker') === false;
}
function getStickerData(target) {
  const mxc = target.getAttribute('data-mx-sticker');
  const body = target.getAttribute('title');
  const httpUrl = target.getAttribute('src');
  return { mxc, body, httpUrl };
}

function StickerBoard({ roomId, onSelect }) {
  const mx = initMatrix.matrixClient;
  const room = mx.getRoom(roomId);
  const scrollRef = useRef(null);
  const searchRef = useRef(null);
  const [frequent, setFrequent] = useState(null);

  const parentIds = initMatrix.roomList.getAllParentSpaces(room.roomId);
  const parentRooms = [...parentIds].map((id) => mx.getRoom(id));

  const packs = getRelevantPacks(mx, [room, ...parentRooms]).filter(
    (pack) => pack.getStickers().length !== 0
  );
  setupSearch(packs);

  const handleOnSelect = useCallback(
    (e) => {
      if (isTargetNotSticker(e.target)) return;

      const stickerData = getStickerData(e.target);
      onSelect(stickerData);
      addToStickerHistory(stickerData);
    },
    [onSelect]
  );

  const handleSearchChange = useCallback(() => {
    const term = searchRef.current.value;
    asyncSearch.search(term);
    scrollRef.current.scrollTop = 0;
  }, []);

  const openGroup = useCallback(
    (groupIndex) => {
      const scrollContent = scrollRef.current.firstElementChild;
      const packCount = packs.length;
      const groupCount = scrollContent.childElementCount;
      const index = groupIndex + (groupCount - packCount - (frequent ? 1 : 0));
      scrollContent.children[index].scrollIntoView();
    },
    [frequent, packs.length]
  );

  useEffect(() => {
    setFrequent(getFrequentStickers());
  }, []);

  return (
    <div className="sticker-board">
      {packs.length > 0 && (
        <ScrollView invisible>
          <div className="sticker-board__sidebar">
            {frequent && (
              <IconButton
                onClick={() => openGroup(0)}
                src={RecentClockIC}
                tooltip="Recent"
                tooltipPlacement="left"
              />
            )}
            {packs.map((pack, index) => {
              const src = mx.mxcUrlToHttp(pack.avatarUrl ?? pack.getStickers()[0].mxc);
              return (
                <IconButton
                  key={pack.id}
                  onClick={() => openGroup(index + (frequent ? 1 : 0))}
                  src={src}
                  tooltip={pack.displayName || 'Unknown'}
                  tooltipPlacement="left"
                  isImage
                />
              );
            })}
          </div>
        </ScrollView>
      )}
      <div className="sticker-board__container">
        <div className="sticker-board__search">
          <RawIcon size="small" src={SearchIC} />
          <Input onChange={handleSearchChange} forwardRef={searchRef} placeholder="Search" />
        </div>
        <ScrollView autoHide ref={scrollRef}>
          <div onClick={handleOnSelect} className="sticker-board__content">
            <SearchedStickers />
            {frequent && <StickerGroup stickers={frequent} name="Frequently used" />}
            {packs.length > 0 ? (
              packs.map((pack) => (
                <StickerGroup key={pack.id} stickers={pack.getStickers()} name={pack.displayName} />
              ))
            ) : (
              <div className="sticker-board__empty">
                <Text>There is no sticker pack.</Text>
              </div>
            )}
          </div>
        </ScrollView>
      </div>
      <div />
    </div>
  );
}
StickerBoard.propTypes = {
  roomId: PropTypes.string.isRequired,
  onSelect: PropTypes.func.isRequired,
};

export default StickerBoard;
