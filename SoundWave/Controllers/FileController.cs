using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.IO;

namespace ExamReact.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class FileController : ControllerBase
    {
        private readonly IWebHostEnvironment _hostingEnvironment;

        public FileController(IWebHostEnvironment hostingEnvironment)
        {
            _hostingEnvironment = hostingEnvironment;
        }

        [HttpPost("{dirName}")]
        public IActionResult SaveImage(string dirName, IFormFile file)
        {
            try
            {
                // Путь сохранения изображения
                string imagePath = Path.Combine(Directory.GetCurrentDirectory(), "ClientApp", "src", "components", "images", dirName, file.FileName);

                // Преобразование данных изображения из base64 в байты
                using (var stream = new MemoryStream())
                {
                    file.CopyTo(stream);
                    byte[] imageBytes = stream.ToArray();

                    // Сохранение изображения
                    System.IO.File.WriteAllBytes(imagePath, imageBytes);
                }

                return Ok("Изображение успешно сохранено");
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, "Ошибка при сохранении изображения");
            }
        }


        [HttpGet("{fileName}")]
        public IActionResult GetImage(string fileName)
        {
            try
            {
                string fileExtension = Path.GetExtension(fileName);
                string mimeType = fileExtension == ".mp4" ? "video/*" : "image/*";

                // Путь к файлу изображения
                string imagePath = Path.Combine(Directory.GetCurrentDirectory(), "ClientApp", "src", "components", "images", "Artists", fileName);

                // Проверяем, существует ли файл
                if (!System.IO.File.Exists(imagePath))
                {
                    return NotFound();
                }

                // Читаем файл и возвращаем его в ответе
                var fileBytes = System.IO.File.ReadAllBytes(imagePath);
                return File(fileBytes, mimeType); // Измените тип MIME в соответствии с типом файла

            }
            catch (Exception ex)
            {
                return StatusCode(500, "Ошибка при получении изображения");
            }
        }

        [HttpGet("{dirName}/{fileName}")]
        public IActionResult GetImage2(string dirName, string fileName)
        {
            try
            {
                // Путь к файлу изображения
                string imagePath = Path.Combine(Directory.GetCurrentDirectory(), "ClientApp", "src", "components", "images", dirName, fileName);

                // Проверяем, существует ли файл
                if (!System.IO.File.Exists(imagePath))
                {
                    return NotFound();
                }

                // Читаем файл и возвращаем его в ответе
                var fileBytes = System.IO.File.ReadAllBytes(imagePath);
                return File(fileBytes, "image/*"); // Измените тип MIME в соответствии с типом файла

            }
            catch (Exception ex)
            {
                return StatusCode(500, "Ошибка при получении изображения");
            }
        }

        [HttpPut("{dirName}/{fileName}")]
        public IActionResult EditImage(string dirName, string fileName, IFormFile file)
        {
            try
            {
                // Path to the existing image file
                string imagePath = Path.Combine(Directory.GetCurrentDirectory(), "ClientApp", "src", "components", "images", dirName, fileName);

                if (System.IO.File.Exists(imagePath))
                {
                    // Delete the existing image file
                    System.IO.File.Delete(imagePath);
                }

                // Save the new image file
                using (var stream = new MemoryStream())
                {
                    file.CopyTo(stream);
                    byte[] imageBytes = stream.ToArray();
                    System.IO.File.WriteAllBytes(imagePath, imageBytes);
                }

                return Ok("Image successfully edited");
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Error editing the image");
            }
        }

        [HttpDelete("{dirName}/{fileName}")]
        public IActionResult DeleteImage(string dirName, string fileName)
        {
            try
            {
                // Path to the image file
                string imagePath = Path.Combine(_hostingEnvironment.ContentRootPath, "ClientApp", "src", "components", "images", dirName, fileName);

                // Check if the file exists
                if (!System.IO.File.Exists(imagePath))
                {
                    return NotFound();
                }

                // Delete the file
                System.IO.File.Delete(imagePath);

                return Ok("Image successfully deleted");
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Error deleting the image");
            }
        }
    }
}
