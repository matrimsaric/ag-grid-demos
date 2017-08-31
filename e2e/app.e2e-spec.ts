import { CliappPage } from './app.po';

describe('cliapp App', () => {
  let page: CliappPage;

  beforeEach(() => {
    page = new CliappPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
