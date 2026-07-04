import React from "react";
import { FaSearch, FaSlidersH, FaTimes } from "react-icons/fa";
import useTopBar, { menuData, collegeList } from "../hooks/useTopBar";
import "../styles/TopBar.css";

export default function TopBar({ onSearch, onFilterChange }) {
  const {
    searchActive,
    activeDropdown,
    selectedOptions,
    showFilter,
    selectedCollege,
    upcomingOnly,
    isAllActive,
    dropdownRefs,
    setSearchActive,
    setShowFilter,
    toggleDropdown,
    handleCheckbox,
    handleCollegeSelect,
    handleClearAll,
    handleSearchChange,
    toggleUpcoming,
  } = useTopBar({ onSearch, onFilterChange });

  return (
    <div className="topbar-container">
      <div className="topbar-content">

        {/* ── Filter Pills ── */}
        <div className="menu-buttons">
          <button
            className={`pill-btn pill-btn--upcoming ${upcomingOnly  ? "active" : ""}`}
            onClick={toggleUpcoming}
          >
            🟢 New
          </button>

          <button
            className={`pill-btn ${isAllActive ? "active" : ""}`}
            onClick={handleClearAll}
          >
            All
          </button>

          {menuData.map((menu) => (
            <div
              key={menu.name}
              className="menu-item"
              ref={(el) => (dropdownRefs.current[menu.name] = el)}
            >
              <button
                className={`pill-btn ${activeDropdown === menu.name ? "active" : ""}`}
                onClick={(e) => toggleDropdown(menu.name, e)}
              >
                {menu.name}
              </button>

              {activeDropdown === menu.name && (
                <div className="dropdown" onClick={(e) => e.stopPropagation()}>
                  {menu.items.map((item) => (
                    <label key={item} className="dropdown-item">
                      <input
                        type="checkbox"
                        checked={selectedOptions.includes(item)}
                        onChange={() => handleCheckbox(item)}
                      />
                      {item}
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ── Search + Filter Icon ── */}
        <div className="right-section">
          <div
            className={`search-box ${searchActive ? "active" : ""}`}
            onClick={() => { if (!searchActive) setSearchActive(true); }}
          >
            <FaSearch onClick={(e) => { e.stopPropagation(); setSearchActive(!searchActive); }} />
            <input
              type="text"
              placeholder="Search..."
              onChange={handleSearchChange}
              tabIndex={searchActive ? 0 : -1}
              readOnly={!searchActive}
              onFocus={(e) => { if (!searchActive) e.target.blur(); }}
            />
          </div>

          <FaSlidersH
            className="filter-icon"
            onClick={() => setShowFilter(true)}
          />
        </div>
      </div>

      {/* ── Filter Popup ── */}
      {showFilter && (
        <div className="filter-overlay" onClick={() => setShowFilter(false)}>
          <div className="filter-popup" onClick={(e) => e.stopPropagation()}>

            <div className="popup-header">
              <h4>Apply Filters</h4>
              <FaTimes onClick={() => setShowFilter(false)} />
            </div>

            <div className="popup-body">
              <div>
                <h5 className="popup-title">Colleges</h5>
                {collegeList.map((college) => (
                  <div
                    key={college}
                    className={`popup-select-item ${
                      selectedCollege === college ? "active" : ""
                    }`}
                    onClick={() => handleCollegeSelect(college)}
                  >
                    {college}
                  </div>
                ))}
              </div>

              <button className="clear-btn" onClick={handleClearAll}>
                Clear All
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
