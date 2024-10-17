/**
 * Generates HTML for a tree structure based on the given node.
 * @param {Object} node - The node of the tree.
 * @param {string} prefix - The prefix for tree indentation.
 * @param {boolean} isLeft - Indicates if the current node is a left child.
 * @returns {string} - The generated HTML for the tree.
 */
function generateTreeHTML(node, prefix = '', isLeft = true) {
  if (!node) return '';

  let treeHTML = '';
  treeHTML += prefix + (isLeft ? "├── " : "└── ") + (node.type === 'operator' ? node.operator : `${node.key} ${node.operator} ${node.value}`) + '<br>';

  if (node.left) treeHTML += generateTreeHTML(node.left, prefix + (isLeft ? "│   " : "    "), true);
  if (node.right) treeHTML += generateTreeHTML(node.right, prefix + (isLeft ? "│   " : "    "), false);

  return treeHTML;
}

/**
* Displays the generated tree HTML in the specified container.
* @param {Object} tree - The tree object to display.
*/
function displayTree(tree) {
  const treeHTML = generateTreeHTML(tree);
  document.getElementById('combined-rules-tree').innerHTML = treeHTML;
}

// Handle Create Rule form submission
document.getElementById('create-rule-form').addEventListener('submit', async function(event) {
  event.preventDefault();
  const ruleName = document.getElementById('ruleName').value;
  const ruleString = document.getElementById('ruleString').value;
  const response = await fetch('/api/rules/create_rule', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ruleName, ruleString }),
  });
  const result = await response.json();
  let treeHTML = generateTreeHTML(result.ruleAST);
  treeHTML += `<br><p>Rule Name: ${result.ruleName}</p>`;
  document.getElementById('create-rule-result').innerHTML = treeHTML;
});

// Handle Combine Rules form submission
document.getElementById('combine-rules-form').addEventListener('submit', async function(event) {
  event.preventDefault();
  const op = document.getElementById('operator1').value;
  const rules = Array.from(document.querySelectorAll('input[id^="combine-rule"]')).map(input => input.value);
  const response = await fetch('/api/rules/combine_rules', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({ rules, op }),
  });
  const result = await response.json();
  let treeHTML = generateTreeHTML(result.ruleAST);
  treeHTML += `<br><p>Rule Name: ${result.ruleName}</p>`;
  document.getElementById('combine-rules-result').innerHTML = treeHTML;
  displayTree(result.ruleAST); // Display Tree
});

// Add functionality to dynamically add more rule inputs
document.getElementById('add-rule').addEventListener('click', function() {
  const newRuleInput = document.createElement('div');
  newRuleInput.classList.add('rule-container');
  newRuleInput.innerHTML = `
      <label>Rule:</label>
      <input type="text" name="rule" required>
      <label>Operator:</label>
      <select name="operator">
          <option value="AND">AND</option>
          <option value="OR">OR</option>
      </select>
  `;
  document.getElementById('rules-inputs').appendChild(newRuleInput);
});

// Handle Evaluate Rule form submission
document.getElementById('evaluate-rule-form').addEventListener('submit', async function(event) {
  event.preventDefault();
  const ast = document.getElementById('evaluate-ast').value;
  const data = document.getElementById('evaluate-data').value;

  const response = await fetch('/api/rules/evaluate_rule', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ast, data }),
  });
  const result = await response.json();
  document.getElementById('evaluate-rule-result').innerText = `Evaluation Result: ${result.result}`;
});
