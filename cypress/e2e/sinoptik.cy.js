/// <reference types="cypress" />

describe("Weather Page Tests for Sinoptik", () => {
  const baseUrl = "https://ua.sinoptik.ua";
  const cityName = "Київ";
  const visitGetRequest = "https://ua.sinoptik.ua/stats/visit/**";
  const searchInputSelector = 'input[type="search"]';
  const menuItemSelector = "menu a span";
  const monthsGenitiveMap = {
    січень: "січня",
    лютий: "лютого",
    березень: "березня",
    квітень: "квітня",
    травень: "травня",
    червень: "червня",
    липень: "липня",
    серпень: "серпня",
    вересень: "вересня",
    жовтень: "жовтня",
    листопад: "листопада",
    грудень: "грудня",
  };

  beforeEach(() => {
    // Disable requests to advertising resources to avoid problems with page loading
    cy.intercept("GET", "**ads**", { statusCode: 200, body: "" });

    cy.intercept("GET", visitGetRequest).as("visitGetRequest");
  });

  it("verify weather data for 7 and 10 days tabs", () => {
    cy.visit(baseUrl);
    cy.get(searchInputSelector).type(cityName);
    cy.contains(menuItemSelector, cityName).click();
    verifyResponseStatus();
    verifyTabs(7);
    verifyTabs(10);
  });

  /**
   * Verify day tabs
   * @param {number} days Number of days for verification (7 or 10).
   */
  function verifyTabs(days) {
    if (![7, 10].includes(days)) {
      throw new Error("Invalid value for 'days'. Only 7 or 10 are allowed.");
    }

    const tabName = days === 7 ? "Тиждень" : "10 днів";
    cy.contains("a", tabName).click();

    const tabSelector = "main div:first a";
    cy.get(tabSelector).should("have.length", days);

    for (let i = 0; i < days; i++) {
      cy.get(tabSelector)
        .eq(i)
        .click()
        .then((clickedTab) => {
          if (i > 0) verifyResponseStatus();

          const date = new Date();
          date.setDate(date.getDate() + i);

          const expectedWeekday = date.toLocaleString("uk-UA", {
            weekday: "long",
          });
          const month = date.toLocaleString("uk-UA", { month: "long" });
          const expectedMonth = monthsGenitiveMap[month];
          const expectedDay = date.getDate().toString();

          const tabWeekday = clickedTab.find("p").eq(0).text();
          const tabDay = clickedTab.find("p").eq(1).text();
          const tabMonth = clickedTab.find("p").eq(2).text();

          expect(tabWeekday).to.eq(expectedWeekday);
          expect(tabDay).to.eq(expectedDay);
          expect(tabMonth).to.eq(expectedMonth);
        });
    }
  }

  /**
   * Verify the response status for intercepted request.
   */
  function verifyResponseStatus() {
    cy.wait("@visitGetRequest").then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
    });
  }
});
