// Tag.java - 标签实体
package com.qd33.bilibili_analysis.entity;

import lombok.Data;
import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "tag")
@Data
public class Tag {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(unique = true, nullable = false)
  private String name;

  private String displayName;
  private String category;
  private String color;

  // 统计信息
  private Integer videoCount = 0;
  private Long totalPlay = 0L;
  private Long totalLike = 0L;
  private Long totalDanmaku = 0L;
  private Long totalFavorite = 0L;
  private Double hotScore = 0.0;
  private Double growthRate = 0.0;

  // 时间信息
  private LocalDateTime firstCrawlTime;
  private LocalDateTime lastCrawlTime;
  private Integer crawlCount = 0;

  // 词云相关
  private Integer fontSize = 14;
  private Double opacity = 1.0;
  private Integer displayOrder = 0;

  @Column(columnDefinition = "boolean default true")
  private Boolean active = true;
}

// TagVideo.java - 标签视频关联实体
@Entity
@Table(name = "tag_video")
@Data
public class TagVideo {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne
  @JoinColumn(name = "tag_id")
  private Tag tag;

  private String bvid;
  private String title;
  private String coverUrl;
  private String upUid;
  private String upName;

  private Integer playCount = 0;
  private Integer likeCount = 0;
  private Integer danmakuCount = 0;
  private Integer favoriteCount = 0;
  private Integer coinCount = 0;
  private Integer shareCount = 0;

  private LocalDateTime publishTime;
  private String duration;
  private String partition;

  private Double hotScore = 0.0;
  private LocalDateTime crawlTime;
}

// TagCloudPool.java - 词云池实体
@Entity
@Table(name = "tag_cloud_pool")
@Data
public class TagCloudPool {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne
  @JoinColumn(name = "tag_id")
  private Tag tag;

  private Integer displayOrder;
  private LocalDateTime addTime;
  private LocalDateTime lastAccessTime;
  private Integer accessCount = 0;

  @Column(columnDefinition = "boolean default true")
  private Boolean inPool = true;
}
