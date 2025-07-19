export const SUPPORTED_LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'csharp', label: 'C#' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
];

export const SAMPLE_CODE: { [key: string]: string } = {
  javascript: `// A simple function to fetch user data
function getUserData(id) {
  var url = 'https://api.example.com/users?id=' + id;
  
  fetch(url)
    .then(function(response) {
      return response.text();
    })
    .then(function(data) {
      var userData = JSON.parse(data);
      console.log("User: " + userData.name);
      
      if(userData.isAdmin == true) {
        console.log("User is an administrator.");
      }
    })
    .catch(function(error) {
      console.log('Request failed');
    });
}`,
  python: `import os

def process_files(directory):
    files = os.listdir(directory)
    for file in files:
        if file.endswith(".txt"):
            f = open(directory + "/" + file, "r")
            content = f.read()
            print("Content of " + file + ":")
            print(content)
            # forgot to close the file
            
def create_report(data):
    report = "User Report:\\n"
    for key, value in data.items():
        report += key + ": " + str(value) + "\\n"
    return report
`
};