const axios = require('axios');
const cheerio = require('cheerio');

const resumeText = "A seasoned Product professional with 15+ years of digital products experience across financial services, SaaS and startups. I bring a unique blend of lean startup agility and strong, proven product principles in problem-solving, prioritisation and delivering timely value to the market. I've gained deep expertise working with senior leadership to craft effective product strategies, roadmaps and product growth initiatives that align with overarching business objectives. Having led dispersed teams locally and abroad, I understand the importance of bringing clarity to cross-functional collaboration and creating clear channels of communication to provide visibility at all levels. "; // Replace with your actual resume text
const jobDescription = `Position: Product Manager
Company: Roller Software
Location: South Melbourne, Melbourne VIC
Type: Full time

About ROLLER:
ROLLER is a global SaaS company operating in over 30 countries, providing software solutions for the leisure and attractions industry. Their platform offers ticketing, point-of-sale, self-serve kiosks, memberships, and digital waiver processes. Team of 200+ professionals worldwide.

Key Responsibilities:
- Deeply understand customer businesses and pain points
- Use data-driven insights to shape product strategy
- Lead cross-functional teams for global product launches
- Create clear product documentation and user stories
- Manage stakeholder relationships and alignment
- Drive product success through clear goals and KPIs

Required Skills & Experience:
- Experienced Product Manager in fast-growing software companies
- Strong analytical and data interpretation skills
- Strategic thinking and business case development
- Excellent written and verbal communication
- Ability to work with ambiguity and shifting priorities
- Detail-oriented with strong execution skills
- Experience in stakeholder management
- Entrepreneurial mindset with calculated risk-taking ability

Benefits:
- Category-leading product with positive customer reviews
- 4 ROLLER Recharge days (additional team leave)
- 'Vibe Tribe' company culture initiatives
- Team member Assistance Program
- 16 weeks paid parental leave (primary carers)
- 4 weeks paid parental leave (secondary carers)
- Learning & development budget
- Career growth opportunities

Interview Process:
1. Initial call with Talent Acquisition Manager
2. Interview with Director of Product
3. Whiteboard Collaboration Session
4. Loop Interviews
5. Reference checks and offer`;

axios.post('http://localhost:3003/api/analyze', {
  resumeText,
  jobDescription
})
.then(response => {
  console.log('Analysis Result:', response.data);
})
.catch(error => {
  console.error('Error:', error.response ? error.response.data : error.message);
});

function splitAnalysisSections(analysisText) {
  console.log("Starting to split analysis text:", analysisText); // Debug log

  if (!analysisText) {
    console.error("Analysis text is undefined");
    return [];
  }

  try {
    // Split the text into sections based on numbered headings
    const sections = [];
    let currentSection = '';
    let currentTitle = '';

    const lines = analysisText.split('\n');
    console.log("Split lines:", lines); // Debug log

    lines.forEach((line) => {
      // Check if line starts with a number followed by a dot (e.g., "1.", "2.", etc.)
      if (/^\d+\./.test(line.trim())) {
        // If we have a previous section, save it
        if (currentTitle) {
          sections.push({
            title: currentTitle,
            content: currentSection.trim()
          });
        }
        currentTitle = line.trim();
        currentSection = '';
      } else {
        currentSection += line + '\n';
      }
    });

    // Add the last section
    if (currentTitle) {
      sections.push({
        title: currentTitle,
        content: currentSection.trim()
      });
    }

    console.log("Processed sections:", sections); // Debug log
    return sections;
  } catch (error) {
    console.error("Error splitting analysis sections:", error);
    return [];
  }
}

async function fetchJobDescription(url) {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const text = $('body').text(); // Simplified selector
    return text.trim();
  } catch (error) {
    console.error('Error fetching job description:', error);
    throw new Error('Failed to fetch job description from URL');
  }
}

async function handleAnalyze(resumeText, jobDescriptionText) {
  try {
    console.log("Sending analysis request...");
    
    const response = await fetch('http://localhost:3003/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        resumeText,
        jobDescription: jobDescriptionText,
      }),
    });

    const result = await response.json();
    console.log("Full response:", result);

    if (!result.analysis) {
      console.error("No analysis received from server");
      alert("No analysis received from server");
      return;
    }

    console.log("Analysis text:", result.analysis);
    const sections = result.analysis.split('\n');
    console.log("Split into lines:", sections);

    const processedSections = sections.reduce((acc, line) => {
      if (line.match(/^\d+\./)) {
        acc.push({ title: line, content: [] });
      } else if (line.trim() && acc.length > 0) {
        acc[acc.length - 1].content.push(line);
      }
      return acc;
    }, []);

    console.log("Final processed sections:", processedSections);
    return processedSections;

  } catch (error) {
    console.error("Detailed error:", error);
    alert(`Something went wrong: ${error.message}`);
  }
}
