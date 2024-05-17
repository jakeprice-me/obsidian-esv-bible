const { Plugin, PluginSettingTab, Setting, requestUrl } = require('obsidian');

// Define default settings
const DEFAULT_SETTINGS = {
    apiKey: 'YOUR_API_KEY',
    includeVerseNumbers: true,
    includeFirstVerseNumbers: true,
    includeFootnotes: true,
    includeFootnoteBody: true,
    includeHeadings: true,
    includeShortCopyright: true,
    includeCopyright: false,
    includePassageHorizontalLines: false,
    includeHeadingHorizontalLines: false,
    horizontalLineLength: 55,
    includeSelahs: true,
    indentUsing: 'space',
    indentParagraphs: 2,
    indentPoetry: true,
    indentPoetryLines: 4,
    indentDeclares: 40,
    indentPsalmDoxology: 30,
    lineLength: 0
};

module.exports = class InsertBibleVerse extends Plugin {
    onload() {
        console.log('Insert Bible Verse Plugin: Loaded');

        this.loadSettings().then(() => {
            this.addSettingTab(new BibleVerseSettingTab(this.app, this));
        });

        this.addCommand({
            id: 'insert-bible-verse',
            name: 'Insert Bible Verse',
            callback: () => {
                console.log('Insert Bible Verse: Command executed');
                this.insertBibleVerse();
            },
        });
    }

async fetchVerse(reference) {
    try {
        console.log('Current settings:', this.settings);
        const { apiKey, includeVerseNumbers, includeFirstVerseNumbers, includeFootnotes,
            includeFootnoteBody, includeHeadings, includeShortCopyright, includeCopyright,
            includePassageHorizontalLines, includeHeadingHorizontalLines, horizontalLineLength,
            includeSelahs, indentUsing, indentParagraphs, indentPoetry, indentPoetryLines,
            indentDeclares, indentPsalmDoxology, lineLength } = this.settings;

        let apiUrl = `https://api.esv.org/v3/passage/text/?q=${encodeURIComponent(reference)}`;

        const params = new URLSearchParams();
        params.append('include-passage-references', 'false');
        params.append('include-verse-numbers', includeVerseNumbers);
        params.append('include-first-verse-numbers', includeFirstVerseNumbers);
        params.append('include-footnotes', includeFootnotes);
        params.append('include-footnote-body', includeFootnoteBody);
        params.append('include-headings', includeHeadings);
        params.append('include-short-copyright', includeShortCopyright);
        params.append('include-copyright', includeCopyright);
        params.append('include-passage-horizontal-lines', includePassageHorizontalLines);
        params.append('include-heading-horizontal-lines', includeHeadingHorizontalLines);
        params.append('horizontal-line-length', horizontalLineLength);
        params.append('include-selahs', includeSelahs);
        params.append('indent-using', indentUsing);
        params.append('indent-paragraphs', indentParagraphs);
        params.append('indent-poetry', indentPoetry);
        params.append('indent-poetry-lines', indentPoetryLines);
        params.append('indent-declares', indentDeclares);
        params.append('indent-psalm-doxology', indentPsalmDoxology);
        params.append('line-length', lineLength);

        apiUrl += '&' + params.toString();

        const options = {
            headers: {
                'Authorization': `Token ${apiKey}`
            }
        };

        const response = await this.makeRequest(apiUrl, options);
        const data = JSON.parse(response.text);

        return {
            passages: data.passages.join('\n'),
            canonical: data.canonical
        };
    } catch (error) {
        console.error('Error fetching verse:', error);
        return 'Error fetching verse';
    }
}

async insertBibleVerse() {
    console.log('Insert Bible Verse: Function called');

    const activeLeaf = this.app.workspace.activeLeaf;
    if (!activeLeaf) {
        console.log('Insert Bible Verse: No active leaf found');
        return;
    }

    const editor = activeLeaf.view.sourceMode.cmEditor;
    if (!editor) {
        console.log('Insert Bible Verse: No editor found');
        return;
    }

    const selectedText = editor.getSelection();
    if (!selectedText) {
        console.log('Insert Bible Verse: No text selected');
        return;
    }

    // Fetch the verse using ESV Bible API
    const verseData = await this.fetchVerse(selectedText);

    console.log('Fetched verse data:', verseData); // Add this line

    // Check if verseData is not null and contains passages and canonical
    if (verseData && verseData.passages && verseData.canonical) {
        const { passages, canonical } = verseData;

        // Remove leading and trailing whitespace, including newlines
        const trimmedVerseText = passages.trim();

        // Anglicize the verse text
        const anglicisedVerseText = this.anglicise(trimmedVerseText);

        // Wrap the trimmed and anglicised verse text in a blockquote
        let blockquoteText = `> ${anglicisedVerseText.replace(/\n/g, '\n> ')}`;

        // Append the canonical after the blockquote with an em dash and a newline
        blockquoteText += `\n>\n> — ${canonical} (ESV)\n\n`;

        // Insert the blockquoted verse into the editor
        editor.replaceSelection(blockquoteText);

    } else {
        console.error('Verse data not available or incomplete.');
    }
}


    async makeRequest(url, options) {
        try {
            const response = await requestUrl({ url, method: 'GET', ...options });
            // Assuming the response is already in JSON format, no need to parse it
            return response;
        } catch (error) {
            console.error('Error making request:', error);
            throw error;
        }
    }

    async loadSettings() {
        try {
            this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
            console.log('Loaded settings:', this.settings); // Add this line
        } catch (error) {
            console.error('Error loading settings:', error);
            this.settings = DEFAULT_SETTINGS;
        }
        return this.settings; // Return the loaded settings
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    // Define a function to anglicise words
    anglicise(text) {
        const replacements = {
            "apologize": "apologise",
            "Apologize": "Apologise",
            "apologized": "apologised",
            "Apologized": "Apologised",
            "authorized": "authorised",
            "Authorized": "Authorised",
            "baptize": "baptise",
            "Baptize": "Baptise",
            "baptized": "baptised",
            "Baptized": "Baptised",
            "baptizes": "baptises",
            "Baptizes": "Baptises",
            "baptizing": "baptising",
            "Baptizing": "Baptising",
            "benefited": "benefitted",
            "Benefited": "Benefitted",
            "clamor": "clamour",
            "Clamor": "Clamour",
            "color": "colour",
            "Color": "Colour",
            "colored": "coloured",
            "Colored": "Coloured",
            "colors": "colours",
            "Colors": "Colours",
            "counselor": "counsellor",
            "Counselor": "Counsellor",
            "counselors": "counsellors",
            "Counselors": "Counsellors",
            "criticize": "criticise",
            "Criticize": "Criticise",
            "criticized": "criticised",
            "Criticized": "Criticised",
            "criticizes": "criticises",
            "Criticizes": "Criticises",
            "criticizing": "criticising",
            "Criticizing": "Criticising",
            "defense": "defence",
            "Defense": "Defence",
            "defenseless": "defenceless",
            "Defenseless": "Defenceless",
            "defenses": "defences",
            "Defenses": "Defences",
            "dishonor": "dishonour",
            "Dishonor": "Dishonour",
            "dishonors": "dishonours",
            "Dishonors": "Dishonours",
            "favor": "favour",
            "Favor": "Favour",
            "favorable": "favourable",
            "Favorable": "Favourable",
            "favorite": "favourite",
            "Favorite": "Favourite",
            "favorites": "favourites",
            "Favorites": "Favourites",
            "favoritism": "favouritism",
            "Favoritism": "Favouritism",
            "fulfil": "fulfill",
            "Fulfil": "Fulfill",
            "fulfilment": "fulfillment",
            "Fulfilment": "Fulfillment",
            "honor": "honour",
            "Honor": "Honour",
            "honors": "honours",
            "Honors": "Honours",
            "jewelry": "jewellery",
            "Jewelry": "Jewellery",
            "judgment": "judgement",
            "Judgment": "Judgement",
            "judgments": "judgements",
            "Judgments": "Judgements",
            "labor": "labour",
            "Labor": "Labour",
            "labored": "laboured",
            "Labored": "Laboured",
            "marveled": "marvelled",
            "Marveled": "Marvelled",
            "marveling": "marvelling",
            "Marveling": "Marvelling",
            "marvelous": "marvellous",
            "Marvelous": "Marvellous",
            "marvelously": "marvellously",
            "Marvelously": "Marvellously",
            "neighbor": "neighbour",
            "Neighbor": "Neighbour",
            "neighboring": "neighbouring",
            "Neighboring": "Neighbouring",
            "neighbors": "neighbours",
            "Neighbors": "Neighbours",
            "organization": "organisation",
            "Organization": "Organisation",
            "organize": "organise",
            "Organize": "Organise",
            "organized": "organised",
            "Organized": "Organised",
            "organizes": "organises",
            "Organizes": "Organises",
            "organizing": "organising",
            "Organizing": "Organising",
            "paralyzed": "paralysed",
            "Paralyzed": "Paralysed",
            "plow": "plough",
            "Plow": "Plough",
            "plowed": "ploughed",
            "Plowed": "Ploughed",
            "plower": "plougher",
            "Plower": "Plougher",
            "plowers": "ploughers",
            "Plowers": "Ploughers",
            "plowing": "ploughing",
            "Plowing": "Ploughing",
            "plowman": "ploughman",
            "Plowman": "Ploughman",
            "plowmen": "ploughmen",
            "Plowmen": "Ploughmen",
            "plows": "ploughs",
            "Plows": "Ploughs",
            "quarreled": "quarrelled",
            "Quarreled": "Quarrelled",
            "quarreling": "quarrelling",
            "Quarreling": "Quarrelling",
            "realize": "realise",
            "Realize": "Realise",
            "realized": "realised",
            "Realized": "Realised",
            "realizes": "realises",
            "Realizes": "Realises",
            "realizing": "realising",
            "Realizing": "Realising",
            "recognize": "recognise",
            "Recognize": "Recognise",
            "recognized": "recognised",
            "Recognized": "Recognised",
            "recognizes": "recognises",
            "Recognizes": "Recognises",
            "recognizing": "recognising",
            "Recognizing": "Recognising",
            "savior": "saviour",
            "Savior": "Saviour",
            "signaled": "signalled",
            "Signaled": "Signalled",
            "splendor": "splendour",
            "Splendor": "Splendour",
            "sulfur": "sulphur",
            "Sulfur": "Sulphur",
            "symbolize": "symbolise",
            "Symbolize": "Symbolise",
            "symbolized": "symbolised",
            "Symbolized": "Symbolised",
            "symbolizes": "symbolises",
            "Symbolizes": "Symbolises",
            "symbolizing": "symbolising",
            "Symbolizing": "Symbolising",
            "sympathize": "sympathise",
            "Sympathize": "Sympathise",
            "sympathized": "sympathised",
            "Sympathized": "Sympathised",
            "sympathizes": "sympathises",
            "Sympathizes": "Sympathises",
            "sympathizing": "sympathising",
            "Sympathizing": "Sympathising",
            "traveled": "travelled",
            "Traveled": "Travelled",
            "traveler": "traveller",
            "Traveler": "Traveller",
            "travelers'": "travellers'",
            "Travelers'": "Travellers'",
            "travelers": "travellers",
            "Travelers": "Travellers",
            "traveling": "travelling",
            "Traveling": "Travelling",
            "unauthorized": "unauthorised",
            "Unauthorized": "Unauthorised",
            "vapor": "vapour",
            "Vapor": "Vapour",
            "vigor": "vigour",
            "Vigor": "Vigour",
            "worshiped": "worshipped",
            "Worshiped": "Worshipped",
            "worshiper": "worshipper",
            "Worshiper": "Worshipper",
            "worshipers": "worshippers",
            "Worshipers": "Worshippers",
            "Worshiping": "Worshipping",
            "worshiping": "worshipping"
            // Add more replacements as needed
        };

        // Replace American spellings with British spellings
        for (const [american, british] of Object.entries(replacements)) {
            const regex = new RegExp(`\\b${american}\\b`, 'gi'); // Case-insensitive whole word match
            text = text.replace(regex, british);
        }

        return text;
    }


};

class BibleVerseSettingTab extends PluginSettingTab {
    display() {
        let { containerEl } = this;

        containerEl.empty();

        new Setting(containerEl)
            .setName('ESV Bible API Key')
            .setDesc('Your ESV Bible API Key')
            .addText(text => text
                .setPlaceholder('Enter your API key')
                .setValue(this.plugin.settings.apiKey)
                .onChange(async (value) => {
                    this.plugin.settings.apiKey = value;
                    await this.plugin.saveSettings();
                })
            );

        new Setting(containerEl)
            .setName('Include Verse Numbers')
            .setDesc('Include verse numbers.')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.includeVerseNumbers)
                .onChange(async (value) => {
                    this.plugin.settings.includeVerseNumbers = value;
                    await this.plugin.saveSettings();
                })
            );

        new Setting(containerEl)
            .setName('Include First Verse Numbers')
            .setDesc('Include the verse number for the first verse of a chapter.')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.includeFirstVerseNumbers)
                .onChange(async (value) => {
                    this.plugin.settings.includeFirstVerseNumbers = value;
                    await this.plugin.saveSettings();
                })
            );

        new Setting(containerEl)
            .setName('Include Footnotes')
            .setDesc('Include callouts to footnotes in the text.')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.includeFootnotes)
                .onChange(async (value) => {
                    this.plugin.settings.includeFootnotes = value;
                    await this.plugin.saveSettings();
                })
            );

        new Setting(containerEl)
            .setName('Include Footnote Body')
            .setDesc('Include footnote bodies below the text. Only works if include-footnotes is also true.')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.includeFootnoteBody)
                .onChange(async (value) => {
                    this.plugin.settings.includeFootnoteBody = value;
                    await this.plugin.saveSettings();
                })
            );

        new Setting(containerEl)
            .setName('Include Headings')
            .setDesc('Include section headings. For example, the section heading of Matthew 5 is "The Sermon on the Mount".')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.includeHeadings)
                .onChange(async (value) => {
                    this.plugin.settings.includeHeadings = value;
                    await this.plugin.saveSettings();
                })
            );

        new Setting(containerEl)
            .setName('Include Short Copyright')
            .setDesc('Include "(ESV)" at the end of the text. Mutually exclusive with include-copyright. This fulfills your copyright display requirements.')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.includeShortCopyright)
                .onChange(async (value) => {
                    this.plugin.settings.includeShortCopyright = value;
                    await this.plugin.saveSettings();
                })
            );

        new Setting(containerEl)
            .setName('Include Copyright')
            .setDesc('Include a copyright notice at the end of the text. Mutually exclusive with include-short-copyright. This fulfills your copyright display requirements.')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.includeCopyright)
                .onChange(async (value) => {
                    this.plugin.settings.includeCopyright = value;
                    await this.plugin.saveSettings();
                })
            );

        new Setting(containerEl)
            .setName('Include Passage Horizontal Lines')
            .setDesc('Include a line of equal signs (====) above the beginning of each passage.')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.includePassageHorizontalLines)
                .onChange(async (value) => {
                    this.plugin.settings.includePassageHorizontalLines = value;
                    await this.plugin.saveSettings();
                })
            );

        new Setting(containerEl)
            .setName('Include Heading Horizontal Lines')
            .setDesc('Include a visual line of underscores (____) above each section heading.')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.includeHeadingHorizontalLines)
                .onChange(async (value) => {
                    this.plugin.settings.includeHeadingHorizontalLines = value;
                    await this.plugin.saveSettings();
                })
            );

        new Setting(containerEl)
            .setName('Horizontal Line Length')
            .setDesc('Controls the length of the line for include-passage-horizontal-lines and include-heading-horizontal-lines.')
            .addText(text => text
                .setPlaceholder('Enter line length')
                .setValue(this.plugin.settings.horizontalLineLength.toString())
                .onChange(async (value) => {
                    this.plugin.settings.horizontalLineLength = parseInt(value);
                    await this.plugin.saveSettings();
                })
            );

        new Setting(containerEl)
            .setName('Include Selahs')
            .setDesc('Include "Selah" in certain Psalms.')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.includeSelahs)
                .onChange(async (value) => {
                    this.plugin.settings.includeSelahs = value;
                    await this.plugin.saveSettings();
                })
            );

        new Setting(containerEl)
            .setName('Indent Using')
            .setDesc('Controls indentation. Must be space or tab.')
            .addDropdown(dropdown => dropdown
                .addOption('space', 'Space')
                .addOption('tab', 'Tab')
                .setValue(this.plugin.settings.indentUsing)
                .onChange(async (value) => {
                    this.plugin.settings.indentUsing = value;
                    await this.plugin.saveSettings();
                })
            );

        new Setting(containerEl)
            .setName('Indent Paragraphs')
            .setDesc('Controls how many indentation characters start a paragraph.')
            .addText(text => text
                .setPlaceholder('Enter indentation')
                .setValue(this.plugin.settings.indentParagraphs.toString())
                .onChange(async (value) => {
                    this.plugin.settings.indentParagraphs = parseInt(value);
                    await this.plugin.saveSettings();
                })
            );

        new Setting(containerEl)
            .setName('Indent Poetry')
            .setDesc('Controls indentation of poetry lines.')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.indentPoetry)
                .onChange(async (value) => {
                    this.plugin.settings.indentPoetry = value;
                    await this.plugin.saveSettings();
                })
            );

        new Setting(containerEl)
            .setName('Indent Poetry Lines')
            .setDesc('Controls how many indentation characters are used per indentation level for poetry lines.')
            .addText(text => text
                .setPlaceholder('Enter indentation')
                .setValue(this.plugin.settings.indentPoetryLines.toString())
                .onChange(async (value) => {
                    this.plugin.settings.indentPoetryLines = parseInt(value);
                    await this.plugin.saveSettings();
                })
            );

        new Setting(containerEl)
            .setName('Indent Declares')
            .setDesc('Controls how many indentation characters are used for "Declares the LORD" in some of the prophets.')
            .addText(text => text
                .setPlaceholder('Enter indentation')
                .setValue(this.plugin.settings.indentDeclares.toString())
                .onChange(async (value) => {
                    this.plugin.settings.indentDeclares = parseInt(value);
                    await this.plugin.saveSettings();
                })
            );

        new Setting(containerEl)
            .setName('Indent Psalm Doxology')
            .setDesc('Controls how many indentation characters are used for Psalm doxologies.')
            .addText(text => text
                .setPlaceholder('Enter indentation')
                .setValue(this.plugin.settings.indentPsalmDoxology.toString())
                .onChange(async (value) => {
                    this.plugin.settings.indentPsalmDoxology = parseInt(value);
                    await this.plugin.saveSettings();
                })
            );

        new Setting(containerEl)
            .setName('Line Length')
            .setDesc('Controls how long a line can be before it is wrapped. Use 0 for unlimited line lengths.')
            .addText(text => text
                .setPlaceholder('Enter line length')
                .setValue(this.plugin.settings.lineLength.toString())
                .onChange(async (value) => {
                    this.plugin.settings.lineLength = parseInt(value);
                    await this.plugin.saveSettings();
                })
            );
    }
}

