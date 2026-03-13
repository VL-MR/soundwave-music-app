using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using System;
using System.IO;

namespace ExamReact.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class DirectoryController : ControllerBase
    {
        private readonly IWebHostEnvironment _hostingEnvironment;

        public DirectoryController(IWebHostEnvironment hostingEnvironment)
        {
            _hostingEnvironment = hostingEnvironment;
        }

        [HttpPost("{dirName}")]
        public IActionResult CreateDirectory(string dirName)
        {
            try
            {
                string dirPath = Path.Combine(_hostingEnvironment.ContentRootPath, "ClientApp", "src", "components", "images", dirName);

                if (Directory.Exists(dirPath))
                {
                    return Conflict("Directory already exists");
                }

                Directory.CreateDirectory(dirPath);

                return Ok("Directory successfully created");
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Error creating the directory");
            }
        }

        [HttpPut("{oldDirName}/{newDirName}")]
        public IActionResult EditDirectory(string oldDirName, string newDirName)
        {
            try
            {
                string oldDirPath = Path.Combine(_hostingEnvironment.ContentRootPath, "ClientApp", "src", "components", "images", oldDirName);
                string newDirPath = Path.Combine(_hostingEnvironment.ContentRootPath, "ClientApp", "src", "components", "images", newDirName);

                if (!Directory.Exists(oldDirPath))
                {
                    return NotFound("Old directory not found");
                }

                if (Directory.Exists(newDirPath))
                {
                    return Conflict("New directory name already exists");
                }

                Directory.Move(oldDirPath, newDirPath);

                return Ok("Directory successfully renamed");
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Error renaming the directory");
            }
        }


        [HttpDelete("{dirName}")]
        public IActionResult DeleteDirectory(string dirName)
        {
            try
            {
                string dirPath = Path.Combine(_hostingEnvironment.ContentRootPath, "ClientApp", "src", "components", "images", dirName);

                if (!Directory.Exists(dirPath))
                {
                    return NotFound();
                }

                Directory.Delete(dirPath, true);

                return Ok("Directory successfully deleted");
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Error deleting the directory");
            }
        }
    }
}
