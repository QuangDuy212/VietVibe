package com.example.VietVibe.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.VietVibe.dto.response.ResUploadFileDTO;
import com.example.VietVibe.exception.StorageException;
import com.example.VietVibe.service.FileService;
import com.example.VietVibe.util.annotation.ApiMessage;

import ws.schild.jave.MultimediaObject;
import ws.schild.jave.info.MultimediaInfo;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.net.URISyntaxException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;
import java.util.List;
import java.util.Arrays;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;

@RestController
@RequestMapping("/files")
public class FileController {
    @Value("${upload.file.uri}")
    private String baseURI;

    private final FileService fileService;

    public FileController(FileService fileService) {
        this.fileService = fileService;
    }

    @PostMapping()
    @ApiMessage("Upload single file")
    public ResponseEntity<ResUploadFileDTO> upload(
            @RequestParam(name = "file", required = false) MultipartFile file,
            @RequestParam("folder") String folder) throws URISyntaxException, IOException, StorageException {

        // 1. Validate file
        if (file == null || file.isEmpty()) {
            throw new StorageException("File is empty.");
        }

        String fileName = file.getOriginalFilename();
        List<String> allowedExtensions = Arrays.asList("mp4", "avi", "mov", "wmv", "mkv", "flv", "webm", "3gp");
        boolean isValid = allowedExtensions.stream().anyMatch(item -> fileName.toLowerCase().endsWith(item));

        if (!isValid) {
            throw new StorageException("Invalid file extension.");
        }

        // 2. Tạo folder và Lưu file
        // Sử dụng đường dẫn vật lý để lưu
        this.fileService.createDirectory(baseURI + folder);
        String uploadedFileName = this.fileService.store(file, folder);

        // --- SỬA LẠI PHẦN ĐƯỜNG DẪN Ở ĐÂY ---
        // Loại bỏ các tiền tố "file:/" để Jave2 đọc được đường dẫn tuyệt đối của
        // Windows
        String cleanBaseURI = baseURI.replace("file:///", "").replace("file:/", "").replace("file:", "");

        // Sử dụng Paths.get để tự động xử lý dấu gạch chéo (/ hoặc \)
        java.nio.file.Path path = java.nio.file.Paths.get(cleanBaseURI, folder, uploadedFileName);
        File source = path.toFile();
        // ------------------------------------

        long durationInSeconds = 0;
        try {
            // Chỉ thực hiện nếu file thực sự tồn tại và đọc được
            if (source.exists() && source.canRead()) {
                MultimediaObject instance = new MultimediaObject(source);
                MultimediaInfo info = instance.getInfo(); // Sẽ không bị treo nữa vì path đã chuẩn
                long durationMs = info.getDuration();
                durationInSeconds = durationMs / 1000;
            }
        } catch (Exception e) {
            // Log lỗi để debug nhưng không làm sập luồng upload
            System.err.println("Lỗi lấy thời lượng video: " + e.getMessage());
        }

        // 4. Trả về DTO
        ResUploadFileDTO res = new ResUploadFileDTO();
        res.setFileName(uploadedFileName);
        res.setUploadedAt(Instant.now());
        res.setDurationSeconds(durationInSeconds);

        // Format sang phút:giây
        String formatted = String.format("%02d:%02d", (durationInSeconds / 60), (durationInSeconds % 60));
        res.setDurationFormatted(formatted);

        return ResponseEntity.ok().body(res);
    }

    @GetMapping()
    public ResponseEntity<Resource> download(
            @RequestParam(name = "fileName", required = false) String fileName,
            @RequestParam(name = "folder", required = false) String folder)
            throws StorageException, FileNotFoundException, URISyntaxException {
        if (fileName == null || folder == null)
            throw new StorageException("Missing required params: (fileName or folder)");

        // check file length
        long fileLength = this.fileService.getFileLength(fileName, folder);
        if (fileLength == 0)
            throw new StorageException("File with name = " + fileName + " not found");

        // download a file
        InputStreamResource resource = this.fileService.getResource(fileName, folder);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                .contentLength(fileLength)
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(resource);
    }

}
